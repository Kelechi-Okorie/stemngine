import { Section } from "../primitives/section";
import { Button } from "../primitives/button";
import { Card } from "../primitives/card";
import { Link } from "../primitives/link";

type UserProgress = {
    lastActive: boolean;
};

export function ContinueSection(progress: UserProgress): HTMLElement | null {

    if (!progress.lastActive) return null;

    return Section({
        title: "Continue Learning",
        children: [
            Card({
                title: "Projectile motion",
                children: [
                    // Button({
                    //     text: "Resume",
                    //     href: "#/run/lesson:projectile:intro"
                    // }),
                    Link({
                        text: "Resume link",
                        href: "#/run/lesson:projectile:intro",
                    })
                ]
            })
        ]
    });
}
