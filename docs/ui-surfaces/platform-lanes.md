# Platform and rendering lanes

## Separate the service from the surface

The backend language does not choose the UI renderer. A Rust, C#, Python, or
Java service owns its domain behavior and contracts; a browser, desktop shell,
or native client owns presentation and direct manipulation. Pick the client
from the interaction the user needs, then cross a typed application seam.

This table supplies starting lanes, not required dependencies. A consuming
application records its actual choice and evidence locally.

| Client context | Start with | Move to a higher-fidelity lane when | Do not use it merely because |
|---|---|---|---|
| JavaScript or TypeScript web | semantic DOM, CSS, and SVG | relationships are spatial, interactive geometry is central, or visual simulation is the task | a dashboard needs decoration |
| JavaScript or TypeScript spatial web | Three.js with a capability-checked WebGPU path and WebGL 2 fallback | topology, facility layout, simulation, 3D product configuration, or large scene inspection is primary | the data is still rows and columns |
| React spatial web | React Three Fiber over the same Three.js scene model | the host is already React and declarative scene composition reduces integration cost | React is present but no scene is needed |
| Rust service or backend | a separate web or desktop client selected by its surface declaration | local desktop workflows need an application shell or native GPU work | Rust on the server implies Rust graphics in the browser |
| Rust desktop or graphics client | Tauri for a web-rendered desktop client; `wgpu` only when the app owns a native GPU renderer | window integration, a local command boundary, or direct GPU control is truly required | a normal operator surface needs a low-level graphics API |
| C# Windows desktop | WinUI 3 and the Windows App SDK for a Windows-first native surface | direct composition, device integration, or desktop animation improves the user task | a game engine is the only route to polished graphics |

## What the named lanes establish

### JavaScript and TypeScript web

[Three.js](https://threejs.org/docs/pages/WebGPURenderer.html) exposes a
`WebGPURenderer` that prefers WebGPU where available and can use a WebGL 2
backend otherwise. A declaration using the `gpu-scene` lane must record its
fallback, because capability detection is part of the consumer boundary.

[React Three Fiber](https://r3f.docs.pmnd.rs/) is a React renderer for Three.js,
not a separate graphics architecture. Use it when the host already has React
and the surface has earned a scene; plain Three.js remains suitable elsewhere.

### Rust

For a Rust backend, keep rendering outside the service boundary. If the client
is a desktop application, [Tauri](https://tauri.app/start/) can host a web
frontend while Rust supplies local commands and bindings. That makes a web
surface possible without making the backend own browser rendering.

When a Rust client genuinely owns native graphics, [wgpu](https://wgpu.rs/)
provides a portable Rust graphics API across native backends and WebAssembly.
It is a specialist lane for a surface that needs direct GPU rendering, not a
default replacement for semantic desktop controls.

### C# Windows desktop

[WinUI 3](https://learn.microsoft.com/en-us/windows/apps/winui/winui3/) is the
Windows App SDK's native UI framework for new Windows desktop applications. Its
composition layer can support high-performance, hardware-accelerated effects
and animation while ordinary XAML controls retain platform interaction and
accessibility behavior. Use a game engine only when the application is actually
a game-like or simulation-first product; this catalog does not make that its
default.

## Example selection

| Request | Surface declaration | Rendering lane |
|---|---|---|
| Diagnose a rack or network topology | `operate` / `topology` | `gpu-scene`, with inspector fallback |
| Compare changes before irreversible approval | `decide` / `staged-review` | `semantic-dom` |
| Follow cross-service failures over time | `monitor` / `event-stream` | `expressive-2d` |
| Compose an evidence-backed report | `create` / `document-workspace` | `semantic-dom` |
| Find dependency and causal relationships | `explore` / `dependency-map` | `expressive-2d` |
