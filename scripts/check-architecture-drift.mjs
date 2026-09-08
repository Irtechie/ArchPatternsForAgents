#!/usr/bin/env node
// Trusted, line-based textual rules only. This is not an import resolver or a
// semantic architecture verifier. Node built-ins keep the consumer independent
// of its implementation language, package manager, and skills harness.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const TOOL = 'archpatterns/check-architecture-drift@1';
const HELP = `Usage: node scripts/check-architecture-drift.mjs --root <consumer> --policy <json>
  [--baseline <previous-report.json>] [--out <new-report.json>] [--as-of YYYY-MM-DD]

Checks explicit ownership and trusted line-based forbidden_regex rules in UTF8 files.
Writes JSON to stdout; --out additionally creates a new report (never overwrites).
Paths for CLI arguments resolve from the working directory. Policy paths are
literal POSIX paths relative to --root. No glob, AST, or semantic analysis.
Exit 0: clean scoped scan; 1: findings/policy change; 2: invalid input or I/O failure.
`;
const fail = message => { throw new Error(message); };
const hash = value => createHash('sha256').update(value).digest('hex');
const canonical = value => JSON.stringify(normalize(value));
function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, normalize(value[key])]));
  return value;
}
function object(value, required, optional, label) {
  if (!value || Array.isArray(value) || typeof value !== 'object') fail(`${label} must be an object`);
  if (required.some(key => !Object.hasOwn(value, key))) fail(`${label} is missing required fields`);
  if (Object.keys(value).some(key => ![...required, ...optional].includes(key))) fail(`${label} has unsupported fields`);
}
function text(value, label) {
  if (typeof value !== 'string' || !value.trim()) fail(`${label} must be a nonempty string`);
}
function identifier(value, label) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)) fail(`${label} must be a portable identifier`);
}
function array(value, label, nonempty = false) {
  if (!Array.isArray(value) || (nonempty && !value.length)) fail(`${label} must be ${nonempty ? 'a nonempty' : 'an'} array`);
}
function unique(values, label) {
  if (new Set(values).size !== values.length) fail(`${label} must be unique`);
}
function date(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(`${label} must be YYYY-MM-DD`);
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) fail(`${label} is not a calendar date`);
}
function relative(value, label, allowDot = true) {
  text(value, label);
  if (allowDot && value === '.') return;
  if (value.includes('\\') || value.includes(':') || /[\x00-\x1f]/.test(value) || value.split('/').some(part => !part || part === '.' || part === '..' || /[. ]$/.test(part))) fail(`${label} must be a normalized repo-relative POSIX path`);
}
const inside = (file, directory) => directory === '.' || file === directory || file.startsWith(`${directory}/`);
const pathKey = value => process.platform === 'win32' ? value.toLowerCase() : value;
const samePath = (a, b) => pathKey(a) === pathKey(b);
function policyInput(value) {
  object(value, ['schema_version', 'application', 'source_roots', 'extensions', 'components'], ['ignore', 'rules', 'exceptions'], 'policy');
  if (value.schema_version !== 1) fail('Unsupported policy schema_version');
  identifier(value.application, 'application');
  for (const key of ['source_roots', 'extensions', 'components']) array(value[key], key, true);
  const p = { ...value };
  for (const key of ['ignore', 'rules', 'exceptions']) if (!Object.hasOwn(p, key)) p[key] = [];
  for (const key of ['ignore', 'rules', 'exceptions']) array(p[key], key);
  for (const key of ['source_roots', 'ignore']) {
    p[key].forEach(item => relative(item, key));
    unique(p[key].map(pathKey), key);
  }
  p.extensions.forEach(ext => {
    if (typeof ext !== 'string' || !/^\.[A-Za-z0-9][A-Za-z0-9._-]*$/.test(ext)) fail('extensions must contain literal suffixes such as .py or .ts');
  });
  unique(p.extensions, 'extensions');
  for (const c of p.components) {
    object(c, ['id', 'owner', 'path', 'responsibility'], [], 'component');
    identifier(c.id, 'component.id'); relative(c.path, 'component.path');
    text(c.owner, 'component.owner'); text(c.responsibility, 'component.responsibility');
  }
  unique(p.components.map(c => c.id), 'component IDs');
  unique(p.components.map(c => pathKey(c.path)), 'component paths');
  for (const r of p.rules) {
    object(r, ['id', 'description', 'component', 'forbidden_regex'], [], 'rule');
    identifier(r.id, 'rule.id'); text(r.description, 'rule.description'); text(r.forbidden_regex, 'rule.forbidden_regex');
    if (!p.components.some(c => c.id === r.component)) fail('Rule references unknown component');
    // No flags, no multi-line input. Regexes are trusted local configuration.
    try { new RegExp(r.forbidden_regex); } catch { fail('Malformed forbidden_regex'); }
  }
  unique(p.rules.map(r => r.id), 'rule IDs');
  for (const e of p.exceptions) {
    object(e, ['id', 'rule', 'component', 'owner', 'reason', 'review_by', 'removal_condition'], [], 'exception');
    identifier(e.id, 'exception.id');
    for (const key of ['owner', 'reason', 'removal_condition']) text(e[key], `exception.${key}`);
    date(e.review_by, 'exception.review_by');
    if (!p.components.some(c => c.id === e.component) || !p.rules.some(r => r.id === e.rule && r.component === e.component)) fail('Exception references unknown or mismatched rule/component');
  }
  unique(p.exceptions.map(e => e.id), 'exception IDs');
  return p;
}

// Check each ancestor too: rejecting just the leaf would allow traversal through
// a directory symlink or Windows junction. Concurrent hostile filesystem swaps
// are outside this local-tool contract; run against a stable checkout.
function noLinks(absolute, allowMissingLeaf = false) {
  const parsed = path.parse(absolute);
  let current = parsed.root;
  const parts = absolute.slice(parsed.root.length).split(path.sep).filter(Boolean);
  for (let i = 0; i < parts.length; i++) {
    current = path.join(current, parts[i]);
    let stat;
    try { stat = fs.lstatSync(current); } catch (error) {
      if (error.code === 'ENOENT' && allowMissingLeaf && i === parts.length - 1) return;
      fail(`Cannot access input path (${error.code ?? 'I/O error'})`);
    }
    if (stat.isSymbolicLink()) fail('Symlink/reparse paths are not supported');
  }
}
function readUtf8(absolute) {
  noLinks(absolute);
  if (!fs.statSync(absolute).isFile()) fail('Input must be a regular file');
  let bytes;
  try { bytes = fs.readFileSync(absolute); } catch (error) { fail(`Cannot read input (${error.code ?? 'I/O error'})`); }
  try { return { bytes, content: new TextDecoder('utf-8', { fatal: true }).decode(bytes) }; }
  catch { fail('Input is not valid UTF8'); }
}
function readJson(absolute) {
  const { content } = readUtf8(absolute);
  try { return JSON.parse(content); } catch { fail('Input is not valid JSON'); }
}
function argumentsFrom(argv) {
  if (argv.length === 1 && ['--help', '-h'].includes(argv[0])) return null;
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    if (!['--root', '--policy', '--baseline', '--out', '--as-of'].includes(key) || Object.hasOwn(args, key) || !argv[i + 1] || argv[i + 1].startsWith('--')) fail('Malformed CLI arguments; use --help');
    args[key] = argv[i + 1];
  }
  if (!args['--root'] || !args['--policy']) fail('--root and --policy are required; use --help');
  const asOf = args['--as-of'] ?? new Date().toISOString().slice(0, 10);
  date(asOf, '--as-of');
  return { root: path.resolve(args['--root']), policy: path.resolve(args['--policy']), baseline: args['--baseline'] ? path.resolve(args['--baseline']) : null, out: args['--out'] ? path.resolve(args['--out']) : null, asOf };
}
function excluded(name, policy) {
  return name.split('/').some(part => ['.git', 'node_modules'].includes(pathKey(part))) || policy.ignore.some(dir => inside(pathKey(name), pathKey(dir)));
}
function inventory(root, policy) {
  noLinks(root);
  if (!fs.statSync(root).isDirectory()) fail('--root must be a directory');
  const paths = new Map();
  function visit(name) {
    if (excluded(name, policy)) return;
    const absolute = path.resolve(root, name);
    noLinks(absolute);
    const stat = fs.lstatSync(absolute);
    if (stat.isDirectory()) {
      for (const child of fs.readdirSync(absolute).sort()) visit(name === '.' ? child : `${name}/${child}`);
    } else if (policy.extensions.some(ext => name.endsWith(ext))) {
      if (!stat.isFile()) fail('Scoped source must be a regular file');
      if (!paths.has(pathKey(absolute))) paths.set(pathKey(absolute), absolute);
    }
  }
  for (const name of policy.source_roots) {
    const absolute = path.resolve(root, name);
    noLinks(absolute);
    if (!fs.statSync(absolute).isDirectory()) fail('source_roots entries must be existing directories');
    visit(name);
  }
  if (!paths.size) fail('Declared scope contains no source files');
  const components = [...policy.components].sort((a, b) => b.path.length - a.path.length);
  return [...paths.values()].sort().map(absolute => {
    const name = path.relative(root, absolute).split(path.sep).join('/');
    const { bytes, content } = readUtf8(absolute);
    const owner = components.find(c => inside(pathKey(name), pathKey(c.path)))?.id ?? null;
    return { absolute, content, path: name, sha256: hash(bytes), owner };
  });
}
function findingId(f) {
  return hash(canonical([f.kind, f.rule, f.component, f.path, f.exception]));
}
function finding(kind, fields = {}) {
  const f = { kind, rule: null, component: null, path: null, line: null, exception: null, exceptions: [], ...fields };
  return { id: findingId(f), ...f };
}
function scan(files, policy, asOf) {
  const findings = [];
  const rules = policy.rules.map(r => ({ ...r, regex: new RegExp(r.forbidden_regex) }));
  for (const file of files) {
    if (file.owner === null) findings.push(finding('unowned_file', { path: file.path }));
    const lines = file.content.split(/\r\n|\n|\r/);
    for (const rule of rules.filter(r => r.component === file.owner)) {
      const line = lines.findIndex(text => rule.regex.test(text));
      if (line !== -1) findings.push(finding('forbidden_match', {
        rule: rule.id, component: file.owner, path: file.path, line: line + 1,
        exceptions: policy.exceptions.filter(e => e.rule === rule.id && e.component === file.owner).map(({ id, owner, reason, review_by, removal_condition }) => ({ id, owner, reason, review_by, removal_condition })),
      }));
    }
  }
  for (const e of policy.exceptions.filter(e => e.review_by < asOf)) findings.push(finding('exception_overdue', { rule: e.rule, component: e.component, exception: e.id }));
  return findings;
}
function gitIdentity(root) {
  const run = args => spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', timeout: 5000, maxBuffer: 8 * 1024 * 1024, windowsHide: true });
  const revision = run(['rev-parse', '--verify', 'HEAD']);
  const status = run(['status', '--porcelain', '--untracked-files=normal']);
  if (revision.status !== 0 || status.status !== 0 || !/^[a-f0-9]{40,64}$/.test(revision.stdout.trim())) return { status: 'unknown', revision: null, dirty: null };
  return { status: 'available', revision: revision.stdout.trim(), dirty: Boolean(status.stdout.trim()) };
}

function integer(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) fail(`${label} must be a nonnegative integer`);
}
function digest(value, label) {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value)) fail(`${label} must be a SHA256 digest`);
}
function strings(values, label) {
  array(values, label); values.forEach(value => text(value, label)); unique(values, label);
}
function validateFinding(f) {
  object(f, ['id', 'kind', 'rule', 'component', 'path', 'line', 'exception', 'exceptions'], [], 'finding');
  if (!['unowned_file', 'forbidden_match', 'exception_overdue', 'policy_changed'].includes(f.kind)) fail('Unknown finding kind');
  for (const key of ['rule', 'component', 'exception']) if (f[key] !== null) identifier(f[key], `finding.${key}`);
  if (f.path !== null) relative(f.path, 'finding.path', false);
  if (f.line !== null && (!Number.isSafeInteger(f.line) || f.line < 1)) fail('Invalid finding line');
  array(f.exceptions, 'finding.exceptions');
  for (const e of f.exceptions) {
    object(e, ['id', 'owner', 'reason', 'review_by', 'removal_condition'], [], 'finding exception');
    identifier(e.id, 'finding exception.id'); date(e.review_by, 'finding exception.review_by');
    for (const key of ['owner', 'reason', 'removal_condition']) text(e[key], `finding exception.${key}`);
  }
  unique(f.exceptions.map(e => e.id), 'finding exception IDs');
  const present = (...keys) => keys.every(key => f[key] !== null);
  const absent = (...keys) => keys.every(key => f[key] === null);
  if (f.kind === 'forbidden_match' ? !present('rule', 'component', 'path', 'line') || !absent('exception')
    : f.kind === 'unowned_file' ? !present('path') || !absent('rule', 'component', 'line', 'exception') || f.exceptions.length
      : f.kind === 'exception_overdue' ? !present('rule', 'component', 'exception') || !absent('path', 'line') || f.exceptions.length
        : !absent('rule', 'component', 'path', 'line', 'exception') || f.exceptions.length) fail('Finding fields do not match its kind');
  if (f.id !== findingId(f)) fail('Invalid finding identity');
}
function validateComparison(c) {
  if (c === null) return;
  object(c, ['baseline_digest', 'baseline_policy_sha256', 'like_for_like', 'findings', 'files', 'deltas'], [], 'comparison');
  digest(c.baseline_digest, 'baseline digest'); digest(c.baseline_policy_sha256, 'baseline policy digest');
  if (typeof c.like_for_like !== 'boolean') fail('Invalid comparison status');
  object(c.findings, ['new', 'resolved', 'persisting'], [], 'comparison findings');
  for (const key of ['new', 'resolved', 'persisting']) { strings(c.findings[key], key); c.findings[key].forEach(id => digest(id, 'comparison finding ID')); }
  unique(Object.values(c.findings).flat(), 'comparison finding partitions');
  object(c.files, ['added', 'removed', 'changed'], [], 'comparison files');
  for (const key of ['added', 'removed', 'changed']) { strings(c.files[key], key); c.files[key].forEach(name => relative(name, 'comparison file path', false)); }
  unique(Object.values(c.files).flat(), 'comparison file partitions');
  object(c.deltas, ['files', 'components', 'rules', 'exceptions', 'dependencies'], [], 'comparison deltas');
  for (const key of ['files', 'components', 'rules', 'exceptions']) if (!Number.isSafeInteger(c.deltas[key])) fail('Invalid count delta');
  if (c.deltas.dependencies !== null) fail('Dependency deltas unavailable in v1');
}
function validateBaseline(r, application) {
  object(r, ['schema_version', 'tool', 'application', 'timestamp', 'as_of', 'git', 'policy_sha256', 'files', 'counts', 'findings', 'scope', 'limitations', 'comparison', 'digest'], [], 'baseline');
  if (r.schema_version !== 1 || r.tool !== TOOL) fail('Unsupported baseline report format/tool');
  if (r.application !== application) fail('Baseline belongs to a different application');
  date(r.as_of, 'baseline as_of');
  if (typeof r.timestamp !== 'string' || !Number.isFinite(Date.parse(r.timestamp)) || new Date(r.timestamp).toISOString() !== r.timestamp) fail('Invalid baseline timestamp');
  digest(r.policy_sha256, 'baseline policy hash'); digest(r.digest, 'baseline digest');
  const { digest: stored, ...contents } = r;
  if (hash(canonical(contents)) !== stored) fail('Baseline integrity check failed');
  object(r.git, ['status', 'revision', 'dirty'], [], 'baseline git');
  if (r.git.status === 'unknown' ? r.git.revision !== null || r.git.dirty !== null
    : r.git.status !== 'available' || typeof r.git.revision !== 'string' || !/^[a-f0-9]{40,64}$/.test(r.git.revision) || typeof r.git.dirty !== 'boolean') fail('Invalid baseline Git identity');
  array(r.files, 'baseline files', true);
  for (const file of r.files) {
    object(file, ['path', 'sha256', 'owner'], [], 'baseline file');
    relative(file.path, 'baseline file path', false); digest(file.sha256, 'baseline file hash');
    if (file.owner !== null) identifier(file.owner, 'baseline file owner');
  }
  unique(r.files.map(f => f.path), 'baseline file paths');
  array(r.findings, 'baseline findings'); r.findings.forEach(validateFinding);
  unique(r.findings.map(f => f.id), 'baseline finding IDs');
  object(r.counts, ['files', 'components', 'rules', 'exceptions', 'dependencies', 'findings'], [], 'baseline counts');
  for (const key of ['files', 'components', 'rules', 'exceptions', 'findings']) integer(r.counts[key], `baseline count ${key}`);
  if (!r.counts.components || r.counts.files !== r.files.length || r.counts.findings !== r.findings.length || r.counts.dependencies !== null) fail('Inconsistent baseline counts');
  object(r.scope, ['source_roots', 'extensions', 'ignore', 'default_ignored_names', 'rules_configured', 'engine'], [], 'baseline scope');
  for (const key of ['source_roots', 'extensions', 'ignore', 'default_ignored_names']) strings(r.scope[key], `baseline scope ${key}`);
  if (!r.scope.source_roots.length || !r.scope.extensions.length || r.scope.rules_configured !== r.counts.rules || r.scope.engine !== 'line-based-javascript-regex') fail('Invalid baseline scope');
  r.scope.source_roots.forEach(name => relative(name, 'baseline source root'));
  r.scope.ignore.forEach(name => relative(name, 'baseline ignored path'));
  if (canonical(r.scope.default_ignored_names) !== canonical(['.git', 'node_modules'])) fail('Invalid default exclusions');
  if (r.scope.extensions.some(ext => !/^\.[A-Za-z0-9][A-Za-z0-9._-]*$/.test(ext))) fail('Invalid baseline extensions');
  for (const file of r.files) {
    if (!r.scope.source_roots.some(dir => inside(pathKey(file.path), pathKey(dir))) || !r.scope.extensions.some(ext => file.path.endsWith(ext)) || excluded(file.path, r.scope)) fail('Baseline file is outside its declared scope');
  }
  for (const f of r.findings.filter(f => f.path !== null)) {
    const file = r.files.find(file => file.path === f.path);
    if (!file || (f.kind === 'unowned_file' ? file.owner !== null : file.owner !== f.component)) fail('Finding does not match baseline inventory');
  }
  if (r.files.some(file => file.owner === null && !r.findings.some(f => f.kind === 'unowned_file' && f.path === file.path))) fail('Unowned baseline file is missing its finding');
  strings(r.limitations, 'baseline limitations');
  if (!r.limitations.length) fail('Baseline limitations are missing');
  validateComparison(r.comparison);
  if (r.comparison !== null) {
    if (r.comparison.like_for_like !== (r.policy_sha256 === r.comparison.baseline_policy_sha256)) fail('Inconsistent policy comparison');
    if (r.comparison.like_for_like === r.findings.some(f => f.kind === 'policy_changed')) fail('Inconsistent policy change finding');
    const ids = [...r.comparison.findings.new, ...r.comparison.findings.persisting].sort();
    if (canonical(ids) !== canonical(r.findings.map(f => f.id).sort())) fail('Inconsistent finding comparison');
  } else if (r.findings.some(f => f.kind === 'policy_changed')) fail('Policy change finding requires a baseline');
  return r;
}
function compare(current, baseline) {
  const currentIds = new Set(current.findings.map(f => f.id));
  const previousIds = new Set(baseline.findings.map(f => f.id));
  const files = new Map(current.files.map(f => [f.path, f]));
  const previousFiles = new Map(baseline.files.map(f => [f.path, f]));
  return {
    baseline_digest: baseline.digest, baseline_policy_sha256: baseline.policy_sha256,
    like_for_like: current.policy_sha256 === baseline.policy_sha256,
    findings: {
      new: [...currentIds].filter(id => !previousIds.has(id)).sort(),
      resolved: [...previousIds].filter(id => !currentIds.has(id)).sort(),
      persisting: [...currentIds].filter(id => previousIds.has(id)).sort(),
    },
    files: {
      added: [...files.keys()].filter(name => !previousFiles.has(name)).sort(),
      removed: [...previousFiles.keys()].filter(name => !files.has(name)).sort(),
      changed: [...files.keys()].filter(name => previousFiles.has(name) && (files.get(name).sha256 !== previousFiles.get(name).sha256 || files.get(name).owner !== previousFiles.get(name).owner)).sort(),
    },
    deltas: { ...Object.fromEntries(['files', 'components', 'rules', 'exceptions'].map(key => [key, current.counts[key] - baseline.counts[key]])), dependencies: null },
  };
}
function main() {
  const args = argumentsFrom(process.argv.slice(2));
  if (args === null) { process.stdout.write(HELP); return 0; }
  const rawPolicy = readJson(args.policy);
  const policy = policyInput(rawPolicy);
  const baseline = args.baseline ? validateBaseline(readJson(args.baseline), policy.application) : null;
  if (args.out) {
    if ([args.policy, args.baseline].filter(Boolean).some(input => samePath(input, args.out))) fail('Output cannot replace policy or baseline');
    noLinks(args.out, true);
    if (fs.existsSync(args.out)) fail('Output already exists; choose a new report path');
  }
  const files = inventory(args.root, policy);
  if (args.out && files.some(f => samePath(f.absolute, args.out))) fail('Output cannot replace source');
  const policyHash = hash(canonical(rawPolicy));
  const findings = scan(files, policy, args.asOf);
  if (baseline && baseline.policy_sha256 !== policyHash) findings.push(finding('policy_changed'));
  findings.sort((a, b) => a.id.localeCompare(b.id));
  const r = {
    schema_version: 1, tool: TOOL, application: policy.application, timestamp: new Date().toISOString(), as_of: args.asOf,
    git: gitIdentity(args.root), policy_sha256: policyHash,
    files: files.map(({ path, sha256, owner }) => ({ path, sha256, owner })),
    counts: { files: files.length, components: policy.components.length, rules: policy.rules.length, exceptions: policy.exceptions.length, dependencies: null, findings: findings.length },
    findings,
    scope: { source_roots: policy.source_roots, extensions: policy.extensions, ignore: policy.ignore, default_ignored_names: ['.git', 'node_modules'], rules_configured: policy.rules.length, engine: 'line-based-javascript-regex' },
    limitations: [
      'Only the declared roots/extensions outside explicit/default exclusions were scanned; zero rules means ownership checks only.',
      'Trusted local JavaScript regexes run per line without flags; matches do not prove an import or a semantic violation. Regexes can be expensive.',
      'No semantic architecture certification, AST/import resolution, foreign database detection, duplicate logic detection, or runtime contract verification.',
      'Dependency counts and deltas are unavailable in v1 (null), never inferred as zero.',
      'SHA256 binds report contents for integrity, not authenticity or approval. Policy/baseline changes require separate review.',
      'Git identity covers the enclosing repository before report output; unavailable identity is unknown. File hashes bind scanned bytes.',
      'Use a stable trusted checkout: this scan is not atomic and cannot defend against concurrent filesystem mutation. Symlink/junction paths are rejected using Node lstat.',
    ],
    comparison: null,
  };
  if (baseline) r.comparison = compare(r, baseline);
  r.digest = hash(canonical(r));
  const output = `${JSON.stringify(r, null, 2)}\n`;
  if (args.out) fs.writeFileSync(args.out, output, { encoding: 'utf8', flag: 'wx' });
  process.stdout.write(output);
  return findings.length ? 1 : 0;
}
try { process.exitCode = main(); }
catch (error) {
  // JSON/regex parser messages can contain source or configuration excerpts.
  // Only our controlled messages or filesystem error codes cross this boundary.
  process.stderr.write(`architecture-drift: ${error.code ? `I/O failure (${error.code})` : error.message}\n`);
  process.exitCode = 2;
}
