7. Why this scales (this is the key insight)

You now have 3 layers clearly separated:

1. Primitives (low-level UI)
Button
Card
Section
reusable
dumb
no domain knowledge
2. Sections (feature-level UI)
ContinueSection
ExploreSection
uses primitives
contains logic
aware of progress/data
3. Views (page-level UI)
renderHome
renderLesson
orchestrates sections
connects to app state
8. What you just avoided

Without this structure, you’d end up with:

duplicated DOM logic
inconsistent UI
hard-to-change layout

This gives you:

controlled composition without a framework

The discipline you must keep
Never do this inside primitives:
❌ access global state
❌ call lesson runner
❌ fetch data
Only:
✔ render based on props

Final mental model
View
 ↓
Sections (logic + composition)
 ↓
Primitives (pure UI)
 ↓
el() (DOM factory)


Final answer
You structure small UI primitives as:
pure functions that return DOM nodes, take props, and contain zero business logic
Then:
sections compose primitives
views compose sections
