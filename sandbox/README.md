## What the sandbox is for

### The sandbox is not:
- Unit tests
- CI tests
- Formal test coverage

### The sandbox is:
- Visual correctness tests
- API exploration
- Regression reproduction
- Performance experiments
- “Does this even work in the browser?”
- So HTML files are expected here.


3️⃣ The correct first step (what you should do now)
✅ Yes — start with HTML entry points

Structure it like this:

sandbox/
├─ index.html          ← test index / launcher
├─ exmamples/
│  ├─ basic-scene.html
│  ├─ geometry.html
│  ├─ materials.html
│  ├─ lighting.html
│  ├─ raycasting.html
│  ├─ batching.html
│  └─ instancing.html
├─ js/
│  ├─ basic-scene.ts
│  ├─ geometry.ts
│  ├─ materials.ts
│  ├─ lighting.ts
│  └─ ...
├─ package.json
├─ tsconfig.json
└─ vite.config.ts (or similar)

8️⃣ How this evolves later (important)

You will not keep raw HTML forever.

Later stages:

| Stage	| What changes |
| ----- | ------------ |
| Early	| Many .html files |
| Mid	  | Auto-generated test index |
| Late  | Examples + screenshots |
| Pro	  | Visual regression tests (Playwright) |

Three.js went through this exact progression.

9️⃣ How this relates to your earlier TypeScript issues

### This sandbox will immediately reveal:
- Missing runtime exports
- Incorrect typing vs runtime mismatch
- Material edge cases (null, optional uniforms)
- Raycaster intersection typing issues
- Geometry batching bugs

You cannot catch those in TS alone — browser tests are mandatory.

✅ Final recommendation (do this)
1. Create sandbox/
2. Add Vite
3. Create:
  - index.html
  - tests/basic-scene.html
  - src/basic-scene.ts
4. Import from @stem/engine
5. Iterate test-by-test

This is the correct, industry-grade path.



The correct architecture (important)
1️⃣ You need three layers
Input (mouse, touch, keyboard)
        ↓
Camera Controller (orbit / pan / zoom logic)
        ↓
Camera (position, target, projection)


DO NOT mix DOM events directly into your camera class.

2️⃣ What kind of navigation do you want?

For a STEM engine + sandbox, you need at least:

| Mode | Purpose |
| ---- | ------- |
| Orbit	| Rotate around an object (default) |
| Pan	| Translate camera parallel to view |
| Zoom | Dolly in/out |
(Later) Fly	Free navigation

10️⃣ What to build next (do this in order)

1️⃣ OrbitControls (mouse only)
2️⃣ Add keyboard panning (WASD + QE)
3️⃣ Add touch support
4️⃣ Add FlyControls (later)
5️⃣ Add CameraController abstraction


Whether navigation is orbit, FPS, CAD, or cinematic



✅ Correct option (industry-grade)

You mirror Three.js’ separation, but cleaner.

@stem/core
  ├─ math/
  ├─ scene/
  ├─ camera/
  └─ renderer/

@stem/input
  ├─ Mouse
  ├─ Keyboard
  └─ Touch

@stem/controls
  ├─ OrbitControls
  ├─ FlyControls
  └─ PanZoomControls



### Input just feeds deltas
Mouse, touch, keyboard, equations, scripts — all produce:
- angle deltas
- pan deltas
- distance deltas
Orbit math doesn’t care where they came from.


### Canonical camera control models
| Control	| Camera model |
|-------- | ------------ |
| Orbit	| Camera constrained to sphere around target |
| FPS	| Camera free in space, orientation-driven |
| Fly	| FPS + acceleration |
| Trackball |	Like orbit, but unconstrained |
| CAD	| Orbit + constrained pan |
| Follow | Camera attached to object |

OrbitControls implements one complete model.
