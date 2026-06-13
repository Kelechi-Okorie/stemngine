

// minimal progress data model
export type UserProgress = {
    userId: string;

    lastActive?: ActiveSession;

    lessons: Record<string, LessonProgress>;

    builds: Record<string, BuildProgress>;
};

// active session (for continue)
// powers "resume where you left off"
export type ActiveSession = {
    type: "concept" | "lesson" | "build";

    entryId: string;

    /**
     * later will store
     *  - simulation state
     *  - variable values
     *  - user configuration
     * 
     * this is how to enable true "resume exactly where I left off"
     */
    state?: any;    // runtime snapshot (optional for now)

    updatedAt: number;
};

export type LessonProgress = {
    lessonId: string;

    currentStep: number;

    completedSteps: number[];

    isComplete: boolean;

    updateAt: number;
};

export type BuildProgress = {
    buildId: string;
    
    attempt: number;

    isComplete: boolean;

    bestScore?: number;

    updateAt: number;
};

// Architecture
// UI
//  ↓
// Runtime (lessons/builds)
//  ↓
// Progress Store
//  ↓
// LocalStorage (for now)

// What you’ve unlocked
// With this small system, you now have:
// ✔ continuity
// ✔ persistence
// ✔ motivation loop
// ✔ real product behavior
