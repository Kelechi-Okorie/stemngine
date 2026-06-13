import { UserProgress, ActiveSession } from "./types";

//TODO: if you're caching locally, include versioning + compactibility
// so that when artifact changes on remote local can be notified and handle it

/**
 * where does this live
 *  - localStorage (fasted)
 *  - indexedDB
 *  - server (user account sync)
 */

export class ProgressStore {

    private data: UserProgress;

    constructor() {

        this.data = this.load();

    }

    public get() {

        return this.data;

    }

    public setActiveSession(session: ActiveSession) {

        this.data.lastActive = session;
        this.save();

    }

    public updateLession(lessonId: string, step: number) {

        const lesson = this.data.lessons[lessonId] ?? {
            lessonId,
            currentStep: 0,
            completedSteps: [],
            isComplete: false,
            updatedAt: Date.now()
        };

        lesson.currentStep = step;
        lesson.updateAt = Date.now();

        this.data.lessons[lessonId] = lesson;

        this.save();

    }

    private load(): UserProgress {

        const raw = localStorage.getItem("progress");

        return raw ? JSON.parse(raw) : {
            userId: "local",
            lessons: {},
            builds: {}
        };

    }

    private save() {

        localStorage.setItem('progress', JSON.stringify(this.data));

    }

}
