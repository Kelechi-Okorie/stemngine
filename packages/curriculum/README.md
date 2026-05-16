## What this curriculum package actually is

It is your:

Knowledge Graph + Educational Model

It will contain:

1. Data (your JSON/YAML)
topic tree
dependency graph
2. Types (VERY important since you code)
export type Topic = {
  id: string
  name: string
  parent?: string
  children: string[]
  dependsOn: string[]
}
3. Utilities

Functions like:

getTopic(id)
getPrerequisites(id)
getLearningPath(from, to)
getUnlockedTopics(userState)
4. Later: logic layer

This is where it becomes powerful:

adaptive progression
prerequisite checking
simulation gating
difficulty layering
How everything connects (this is the key insight)
Engine

Uses curriculum for:

what variables to expose
what systems exist
simulation configuration

Example:

Projectile Motion → curriculum says:
  depends on velocity, acceleration
→ engine loads simulation config
Editor

Uses curriculum for:

UI navigation (topic tree)
showing dependencies visually
lesson organization
Future (this is where it gets interesting)
AI tutor uses curriculum graph
Progress tracking system uses dependencies
Simulation recommender uses graph traversal
Suggested folder structure

Inside curriculum/:

curriculum/
  src/
    data/
      physics.json
      mathematics.json
    types/
      topic.ts
    graph/
      buildGraph.ts
      traversal.ts
    utils/
      getDependencies.ts
      getPath.ts
  package.json
Important design decision (don’t skip this)

Split your data like this:

Option A (bad long-term)
all_subjects.json
Option B (better)
physics.json
math.json
chemistry.json
Option C (best for you)
physics/
  mechanics.json
  waves.json
math/
  algebra.json
  trigonometry.json

Why?

Because:

you’ll scale to hundreds of topics
you’ll want modular loading
you’ll map simulations per domain
Naming matters (more than you think)

Don’t call it:

data ❌
syllabus ❌

Call it something like:

curriculum ✅
knowledge ✅
learning-graph ✅ (my personal favorite for your project)
One more strategic insight

What you are building here is more valuable than the simulations themselves.

Most people can build simulations.

Almost nobody builds:

a structured, queryable, dependency-aware model of STEM knowledge

That’s your long-term moat.