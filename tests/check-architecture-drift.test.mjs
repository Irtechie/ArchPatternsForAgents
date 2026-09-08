import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const cli = fileURLToPath(new URL('../scripts/check-architecture-drift.mjs', import.meta.url));
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-drift-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (name, content) => {
    const target = path.join(root, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
    return target;
  };
  const policy = {
    schema_version: 1, application: 'test-app', source_roots: ['src'], extensions: ['.py', '.ts'],
    components: [
      { id: 'consumer', path: 'src/consumer', owner: 'app', responsibility: 'Call the domain contract' },
      { id: 'domain', path: 'src/domain', owner: 'domain team', responsibility: 'Own decisions' },
    ],
    rules: [{ id: 'no-internals', description: 'Use public contract', component: 'consumer', forbidden_regex: 'provider[./]internal' }],
    exceptions: [], ignore: [],
  };
  write('src/consumer/app.py', 'from provider.public import call\n');
  write('src/domain/service.ts', 'export const decide = () => true;\n');
  const savePolicy = () => write('policy.json', JSON.stringify(policy));
  savePolicy();
  const run = (...args) => spawnSync(process.execPath, [cli, '--root', root, '--policy', path.join(root, 'policy.json'), '--as-of', '2026-09-08', ...args], { encoding: 'utf8' });
  return { root, write, policy, savePolicy, run };
}
const report = (result, exit = 0) => {
  assert.equal(result.status, exit, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
};

test('clean Python/TypeScript scope reports identity and content without source contents', t => {
  const f = fixture(t);
  const r = report(f.run());
  assert.equal(r.application, 'test-app');
  assert.equal(r.schema_version, 1);
  assert.equal(r.as_of, '2026-09-08');
  assert.equal(r.files.length, 2);
  assert.equal(r.findings.length, 0);
  assert.equal(r.git.revision, null);
  assert.equal(r.counts.dependencies, null);
  assert.match(r.digest, /^[a-f0-9]{64}$/);
  assert.match(r.files[0].sha256, /^[a-f0-9]{64}$/);
  assert.equal(r.files[0].owner, 'consumer');
  assert.ok(!JSON.stringify(r).includes('from provider.public'));
});

test('a forbidden import mutation fails at the CLI boundary without exposing text', t => {
  const f = fixture(t);
  f.write('src/consumer/app.py', 'from provider.internal import PRIVATE_CONTENT_DO_NOT_PRINT\n');
  const result = f.run();
  const r = report(result, 1);
  assert.equal(r.findings[0].kind, 'forbidden_match');
  assert.equal(r.findings[0].line, 1);
  assert.ok(!result.stdout.includes('PRIVATE_CONTENT_DO_NOT_PRINT'));
});

test('weakened or deleted rules block comparison even when the current scan is clean', t => {
  const f = fixture(t);
  report(f.run('--out', path.join(f.root, 'before.json')));
  f.policy.rules = [];
  f.savePolicy();
  const r = report(f.run('--baseline', path.join(f.root, 'before.json')), 1);
  assert.ok(r.findings.some(x => x.kind === 'policy_changed'));
  assert.equal(r.comparison.like_for_like, false);
  assert.equal(r.comparison.deltas.rules, -1);
  assert.equal(r.scope.rules_configured, 0);
});

test('published policy example is executable against a synthetic consumer', t => {
  const f = fixture(t);
  const example = fileURLToPath(new URL('../docs/architecture-patterns/drift-policy.example.json', import.meta.url));
  const expected = JSON.parse(fs.readFileSync(example, 'utf8'));
  f.write('policy.json', fs.readFileSync(example));
  assert.equal(report(f.run()).application, expected.application);
  f.write('src/consumer/app.py', 'import provider.internal\n');
  assert.equal(report(f.run(), 1).findings[0].rule, 'no-provider-internals');
});

test('most-specific component owns files, overlapping roots deduplicate, excluded trees stay excluded', t => {
  const f = fixture(t);
  f.policy.source_roots.push('src/consumer');
  f.policy.ignore.push('src/ignored');
  f.policy.components.unshift({ id: 'all', owner: 'platform', path: 'src', responsibility: 'Default ownership' });
  f.write('src/other.ts', 'const other = true;\n');
  f.write('src/ignored/unsafe.py', 'provider.internal\n');
  f.write('src/node_modules/unsafe.py', 'provider.internal\n');
  f.write('src/.git/unsafe.py', 'provider.internal\n');
  f.write('src/consumer/notes.txt', 'provider.internal\n');
  f.savePolicy();
  const r = report(f.run());
  assert.equal(r.counts.files, 3);
  assert.equal(r.files.find(x => x.path === 'src/consumer/app.py').owner, 'consumer');
  assert.equal(r.files.find(x => x.path === 'src/other.ts').owner, 'all');
});

test('unowned sources fail and repeated forbidden lines share one identity across shifted evidence', t => {
  const f = fixture(t);
  f.write('src/unowned.ts', 'const orphan = true;\n');
  f.write('src/consumer/app.py', 'provider.internal\nprovider.internal\n');
  const before = report(f.run('--out', path.join(f.root, 'before.json')), 1);
  assert.equal(before.findings.length, 2);
  assert.ok(before.findings.some(x => x.kind === 'unowned_file'));
  f.write('src/consumer/app.py', '# moved\nprovider.internal\nprovider.internal\n');
  const after = report(f.run('--baseline', path.join(f.root, 'before.json')), 1);
  assert.equal(after.findings.find(x => x.kind === 'forbidden_match').line, 2);
  assert.equal(after.comparison.findings.persisting.length, 2);
  assert.deepEqual(after.comparison.findings.new, []);
  assert.deepEqual(after.comparison.files.changed, ['src/consumer/app.py']);
});

test('new/resolved findings and additions/removals are compared without modifying baseline', t => {
  const f = fixture(t);
  f.write('src/consumer/app.py', 'provider.internal\n');
  const before = report(f.run('--out', path.join(f.root, 'before.json')), 1);
  const saved = fs.readFileSync(path.join(f.root, 'before.json'));
  fs.unlinkSync(path.join(f.root, 'src/consumer/app.py'));
  f.write('src/domain/second.ts', 'export const second = 2;\n');
  const after = report(f.run('--baseline', path.join(f.root, 'before.json')));
  assert.deepEqual(after.comparison.findings.resolved, [before.findings[0].id]);
  assert.deepEqual(after.comparison.files.removed, ['src/consumer/app.py']);
  assert.deepEqual(after.comparison.files.added, ['src/domain/second.ts']);
  assert.equal(after.comparison.deltas.files, 0);
  assert.deepEqual(fs.readFileSync(path.join(f.root, 'before.json')), saved);
});

test('exceptions annotate violations without suppression; overdue finding survives absence of matches', t => {
  const f = fixture(t);
  f.policy.exceptions = [{ id: 'migration', rule: 'no-internals', component: 'consumer', owner: 'app', reason: 'Pending migration', review_by: '2026-09-08', removal_condition: 'Use public API' }];
  f.savePolicy();
  f.write('src/consumer/app.py', 'provider.internal\n');
  const dueToday = report(f.run(), 1);
  assert.equal(dueToday.findings.length, 1);
  assert.equal(dueToday.findings[0].exceptions[0].id, 'migration');
  f.policy.exceptions[0].review_by = '2026-09-07';
  f.savePolicy();
  assert.equal(report(f.run(), 1).findings.length, 2);
  f.write('src/consumer/app.py', 'provider.public\n');
  const overdue = report(f.run(), 1);
  assert.equal(overdue.findings.length, 1);
  assert.equal(overdue.findings[0].kind, 'exception_overdue');
});

test('regex matching is per-line and comments remain textual matches', t => {
  const f = fixture(t);
  f.policy.rules[0].forbidden_regex = 'provider\\s+internal';
  f.savePolicy();
  f.write('src/consumer/app.py', 'provider\ninternal\n');
  report(f.run());
  f.write('src/consumer/app.py', '# provider internal\n');
  report(f.run(), 1);
});

test('canonical policy hash ignores formatting/key order but catches actual weakening', t => {
  const f = fixture(t);
  const first = report(f.run('--out', path.join(f.root, 'before.json')));
  f.write('policy.json', JSON.stringify(Object.fromEntries(Object.entries(f.policy).reverse()), null, 4));
  assert.equal(report(f.run('--baseline', path.join(f.root, 'before.json'))).policy_sha256, first.policy_sha256);
  f.policy.rules[0].forbidden_regex = 'never_happens';
  f.savePolicy();
  assert.equal(report(f.run('--baseline', path.join(f.root, 'before.json')), 1).comparison.like_for_like, false);
});

test('malformed policy and scope inputs fail explicitly and never produce reports', t => {
  const f = fixture(t);
  const original = structuredClone(f.policy);
  const changes = [
    p => p.schema_version = 2,
    p => p.silent_extra = true,
    p => p.components[0].surprise = true,
    p => p.source_roots = [],
    p => p.source_roots = ['missing'],
    p => p.source_roots = ['../escape'],
    p => p.source_roots = ['/absolute'],
    p => p.source_roots = ['src/../src'],
    p => p.source_roots = ['src/.. /escape'],
    p => p.source_roots = ['src\\consumer'],
    p => p.source_roots = ['src/consumer/app.py'],
    p => p.extensions = [],
    p => p.extensions = ['*.py'],
    p => p.components = [],
    p => p.components.push({ ...p.components[0], id: 'duplicate-path' }),
    p => p.components[1].id = p.components[0].id,
    p => p.rules[0].component = 'unknown',
    p => p.rules[0].forbidden_regex = '[',
    p => p.rules.push({ ...p.rules[0] }),
    p => p.ignore = ['../escape'],
    p => p.ignore = ['src'],
    p => p.rules = null,
    p => p.exceptions = [{ id: 'x', rule: 'unknown', component: 'consumer', owner: 'a', reason: 'r', review_by: '2026-09-08', removal_condition: 'c' }],
    p => p.exceptions = [{ id: 'x', rule: 'no-internals', component: 'domain', owner: 'a', reason: 'r', review_by: '2026-09-08', removal_condition: 'c' }],
    p => p.exceptions = [{ id: 'x', rule: 'no-internals', component: 'consumer', owner: 'a', reason: 'r', review_by: '2026-02-30', removal_condition: 'c' }],
  ];
  for (const change of changes) {
    const next = structuredClone(original); change(next);
    f.write('policy.json', JSON.stringify(next));
    const result = f.run('--out', path.join(f.root, 'must-not-exist.json'));
    assert.equal(result.status, 2, change.toString());
    assert.equal(result.stdout, '');
    assert.equal(fs.existsSync(path.join(f.root, 'must-not-exist.json')), false);
  }
});

test('CLI rejects missing/duplicate/unsupported arguments and invalid dates, help succeeds', () => {
  for (const args of [[], ['--root'], ['--unknown', 'x'], ['--help', '--root', '.'], ['--root', '.', '--policy', 'p', '--root', '.'], ['--root', '.', '--policy', 'p', '--as-of', '2026-02-30']]) {
    assert.equal(spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' }).status, 2);
  }
  assert.equal(spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8' }).status, 0);
});

test('invalid source UTF8, invalid JSON and missing/unreadable-shaped inputs fail explicitly', t => {
  const f = fixture(t);
  assert.equal(f.run('--as-of', '2026-02-30').status, 2); // duplicate option also cannot proceed
  f.write('src/consumer/app.py', Buffer.from([0xc3, 0x28]));
  assert.equal(f.run().status, 2);
  f.write('src/consumer/app.py', 'safe\n');
  f.write('policy.json', '{BAD_JSON_PRIVATE_SENTINEL');
  const malformed = f.run();
  assert.equal(malformed.status, 2);
  assert.ok(!malformed.stderr.includes('PRIVATE_SENTINEL'));
  fs.unlinkSync(path.join(f.root, 'policy.json'));
  assert.equal(f.run().status, 2);
  fs.mkdirSync(path.join(f.root, 'policy.json'));
  assert.equal(f.run().status, 2);
});

test('malformed, tampered, different-application, and rehashed inconsistent baselines fail', t => {
  const f = fixture(t);
  const base = report(f.run());
  const stable = value => JSON.stringify(sort(value));
  function sort(value) {
    if (Array.isArray(value)) return value.map(sort);
    if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, sort(value[key])]));
    return value;
  }
  const sign = value => { delete value.digest; value.digest = createHash('sha256').update(stable(value)).digest('hex'); return value; };
  const baselines = [
    '{', JSON.stringify({}), JSON.stringify({ ...base, application: 'other-app' }),
    JSON.stringify({ ...base, counts: { ...base.counts, files: 99 } }),
    JSON.stringify(sign({ ...base, counts: { ...base.counts, files: 99 } })),
    JSON.stringify(sign({ ...base, surprise: true })),
    JSON.stringify(sign({ ...base, files: [{ ...base.files[0], path: '../escape.py' }] })),
    JSON.stringify(sign({ ...base, schema_version: 999 })),
    JSON.stringify(sign({ ...base, files: [{ ...base.files[0], owner: null }, base.files[1]] })),
  ];
  for (const contents of baselines) {
    f.write('baseline.json', contents);
    const result = f.run('--baseline', path.join(f.root, 'baseline.json'));
    assert.equal(result.status, 2, contents);
    assert.equal(result.stdout, '');
  }
  // A report containing comparison metadata can itself be read as a baseline.
  f.write('baseline.json', JSON.stringify(base));
  const compared = report(f.run('--baseline', path.join(f.root, 'baseline.json')));
  f.write('second.json', JSON.stringify(compared));
  report(f.run('--baseline', path.join(f.root, 'second.json')));
});

test('create-only output never overwrites policy, baseline, source or existing reports', t => {
  const f = fixture(t);
  report(f.run('--out', path.join(f.root, 'before.json')));
  const snapshots = new Map(['policy.json', 'before.json', 'src/consumer/app.py'].map(name => [name, fs.readFileSync(path.join(f.root, name))]));
  for (const [name, before] of snapshots) {
    const result = f.run('--baseline', path.join(f.root, 'before.json'), '--out', path.join(f.root, name));
    assert.equal(result.status, 2);
    assert.deepEqual(fs.readFileSync(path.join(f.root, name)), before);
  }
  assert.equal(f.run('--out', path.join(f.root, 'missing-parent', 'report.json')).status, 2);
  assert.equal(fs.existsSync(path.join(f.root, 'missing-parent')), false);
  const beforeTree = fs.readdirSync(f.root, { recursive: true }).sort();
  report(f.run());
  assert.deepEqual(fs.readdirSync(f.root, { recursive: true }).sort(), beforeTree);
});

test('symlink/junction roots, source subtrees and output parents fail instead of escaping', t => {
  const f = fixture(t);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-link-target-'));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  fs.writeFileSync(path.join(outside, 'unsafe.py'), 'private sentinel\n');
  const link = path.join(f.root, 'src', 'linked');
  try { fs.symlinkSync(outside, link, process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) return t.skip(`Directory links unavailable: ${error.code}`);
    throw error;
  }
  assert.equal(f.run().status, 2);
  f.policy.ignore = ['src/linked']; f.savePolicy();
  report(f.run()); // explicitly excluded content is outside declared scope
  assert.equal(f.run('--out', path.join(link, 'report.json')).status, 2);
  assert.equal(fs.existsSync(path.join(outside, 'report.json')), false);
  f.policy.source_roots = ['src/linked']; f.savePolicy();
  assert.equal(f.run().status, 2);
});

test('file symlinks fail when the OS permits their creation', t => {
  const f = fixture(t);
  try { fs.symlinkSync(path.join(f.root, 'src/domain/service.ts'), path.join(f.root, 'src/consumer/linked.ts'), 'file'); }
  catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) return t.skip(`File links unavailable: ${error.code}`);
    throw error;
  }
  assert.equal(f.run().status, 2);
});

test('Git revision and dirty state are live evidence when Git is available', t => {
  const f = fixture(t);
  const git = (...args) => spawnSync('git', ['-C', f.root, ...args], { encoding: 'utf8' });
  if (git('init').status !== 0) return t.skip('Git unavailable');
  assert.equal(git('add', '.').status, 0);
  assert.equal(git('-c', 'user.name=Drift Test', '-c', 'user.email=drift-test@example.invalid', 'commit', '--no-gpg-sign', '-m', 'Fixture').status, 0);
  const clean = report(f.run());
  assert.equal(clean.git.status, 'available');
  assert.equal(clean.git.dirty, false);
  assert.equal(clean.git.revision, git('rev-parse', 'HEAD').stdout.trim());
  f.write('src/consumer/app.py', '# changed\n');
  assert.equal(report(f.run()).git.dirty, true);
});

test('Windows case variants of overlapping roots still inventory each source once', { skip: process.platform !== 'win32' }, t => {
  const f = fixture(t);
  f.policy.source_roots.push('SRC/consumer');
  f.savePolicy();
  const r = report(f.run());
  assert.equal(r.files.length, 2);
  assert.ok(r.files.some(file => file.path === 'src/consumer/app.py'));
});
