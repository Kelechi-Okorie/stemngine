import { Section } from "../primitives/section";
import { Button } from "../primitives/button";
import { Card } from "../primitives/card";
import { Link } from "../primitives/link";

type UserProgress = {
    lastActive: boolean;
};

export function ExploreSection(progress: UserProgress): HTMLElement | null {

    if (!progress.lastActive) return null;

    return Section({
        title: "Explore concepts",
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
