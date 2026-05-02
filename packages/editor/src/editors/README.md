App
 ├── SimulationManager  ← truth
 ├── State              ← UI state (selection, cursor, etc.)
 └── Editors
       ├── ViewportEditor (3D)
       ├── GraphEditor (2D)
       ├── TimelineEditor
       ├── EquationEditor
       ├── Outliner
       └── Properties


Each editor = A projection + interaction layer over the same data

Editors do NOT own data
Editors VIEW and EDIT shared state


🚀 What you should do next (practical)

Don’t jump to new editors yet. Finish one properly.

In your current viewport:
✅ Add grid (visual only)
✅ Cursor placement (done)
✅ Spawn at cursor (important next)
🔜 Basic transform (move object)

That gives you a complete minimal editor

💡 Then your next milestone
Build a 2D graph editor
Not because it's “nice to have”, but because:
It will force your architecture to generalize

You’re not building:
“A better Blender”

You’re building:
“A system where different mathematical worlds can be explored through different editors”

The 3D viewport is just the first door.