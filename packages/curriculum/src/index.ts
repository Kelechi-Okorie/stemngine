// examples

import { buildCurriculum } from "./curriculum";

// load everything
const graph = buildCurriculum();

// get a topic
graph.get("physics.mechanics.acceleration");

// validate automatically on startup
// perfect for
// - editor
// - engine
// - CI checks


// 🚨 Important design insight (don’t skip this)

// You now have:
// Two graphs in one system:
// 1. Tree (UI structure)
// parent
// children
// 2. DAG (learning logic)
// dependsOn

// This is EXACTLY what serious learning systems use.


// 🔥 What you just built (big picture)

// You now have:
// ✔ a filesystem-based CMS
// ✔ a graph compiler
// ✔ a validation layer
// ✔ a single source of truth for STEM knowledge

// This is already enough to power:
// simulation gating
// adaptive learning paths
// AI tutoring
// curriculum visualization
// Next step (very important)

// If you continue correctly, the next layer is:
// 👉 Graph queries API
// Example:
// “what unlocks projectile motion?”
// “what can student learn next?”
// “shortest learning path to X?”

// That’s where your system becomes intelligent, not just structured.
