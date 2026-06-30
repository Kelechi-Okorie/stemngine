import { el } from "../ui/el";
import { BuildSection } from "../ui/sections/BuildSection";
import { ContinueSection } from "../ui/sections/ContinueSection";
import { ExploreSection } from "../ui/sections/ExploreSection";
import { Section } from "../ui/primitives/section";
import { Card } from "../ui/primitives/card";
import { Link } from "../ui/primitives/link";

/**
 * This is not a component-based UI
 * This is a runtime-driven DOM renderer
*/

// Explore (free interaction)
// Lessons (guided understanding)
// Builds (applied / real-world usage)


// This is a critical moment in your product design.
// A first-time user is the hardest case because:
// they have no progress, no context, no mental model of your system
// So your homepage must do three things simultaneously:

// 1. Explain what this product is
// 2. Give a clear starting point
// 3. Make it feel interactive immediately

// If you miss any one of these → user leaves.

// 1. The correct mental model
// For a new user, your homepage is not a dashboard.
// It is:
// an onboarding launchpad disguised as a homepage

export function renderHome() {

    const root = document.getElementById('root')!;

    const progress = { lastActive: true };

    // const children = [
    //     el("h1", { text: "Welcome back" }),

    //     ContinueSection(progress),
    //     ExploreSection(progress),
    //     BuildSection(progress)

    // ].filter(Boolean);  // remove nulls

    const children = [
        // el("h1", {text: "STEMngine"}),

        // el("p", { text: "Learn STEM by interacting with real systems"}),
        // el("p", {text: "-not just reading theory"})

        Section({
            title: "STEMngine",
            children: [
                Card({
                    children: [
                        // el("p", {text: "Learn STEM by interacting with real systems"}),
                        // el("p", {text: "-not just reading theory"}),
                        el("div", {}, [
                            el("span",
                                { text: "Learn STEM by interacting with real systems" },
                                [,
                                    el("br"),
                                    "-not just reading theory"
                                ]),
                            // el("span", {text: "-not just reading theory"})
                        ])
                    ]
                })
            ]
        }),

        // What happens when they click "Start"
        // Click Start
        //   ↓
        // GET /bundle?entry=lesson.motion.intro
        //   ↓
        // Open Lesson Runner UI
        //   ↓
        // Immediate interaction

        // No intermediate screens.

        Section({
            title: "Start here",
            children: [
                Link({ text: "▶️ Motion and forces (Beginner lessons)", href: "#" }),
                el('br'),
                Link({ text: "[ Start ▶️ ]", href: "#" })
            ]
        }),

        Section({
            title: "Explore concepts",
            children: [
                el("span", { text: "➡️ Interact with " }),
                Link({ text: "velocity, ", href: "#/run/explore.velocity.direction" }),
                Link({ text: "acceleration, ", href: "#" }),
                Link({ text: "forces", href: "#" })
            ]
        }),

        Section({
            title: "Learn step by step",
            children: [
                Link({ text: "➡️ Guilded lessons with real-time feedback", href: "#" })
            ]
        }),

        Section({
            title: "Build systems",
            children: [
                Link({ text: "➡️ Solve real problems like an engineer", href: "#" })
            ]
        }),

        Section({
            title: "What you can do",
            children: [
                el("p", { text: "Explore concepts" }),
                el("p", { text: "Learn step-by-step" }),
                el("p", { text: "Build systems" })
            ]
        }),

        Section({
            title: "Try something",
            children: [
                Link({ text: "[Velocity] ", href: "#" }),
                Link({ text: "[Projectile]", href: "#" })
            ]
        })
    ];

    // After first interaction (important)

    // Once they complete even 1 step, everything changes:

    // now you have progress
    // now homepage becomes “Continue”
    // now system feels personal

    
    // Final answer
    // For a first-time user, the homepage should show:
    // a clear starting lesson, a simple explanation of value, and a few optional previews

    root.replaceChildren(
        el("div", { class: "container" }, children)
    );

}


// 10. The real scaling strategy

// You scale not by frameworks, but by:

// 1. View functions
// renderHome()
// renderLesson()
// renderBuild()

// 2. Small UI primitives
// Card()
// Button()
// Section()

// 3. State-driven rendering
// if (progress.lastActive) {
//   showContinue()
// }

// What the user feels (this matters)

// If done right:

// “I always know what to do next”
// “I’m progressing”
// “I can explore if I want”

// If done wrong:

// “Where do I start?”
// “What is this app?”
// 11. What NOT to do

// Avoid:

// ❌ showing full curriculum tree
// ❌ showing raw topics
// ❌ showing empty workspace
// ❌ forcing user to search
