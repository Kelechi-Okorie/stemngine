import { UserProgress } from "./progress/types";


export class LessonRunner {

    public lesson: Lesson;
    public stepIndex: number;
    public progress: UserProgress;

    constructor(lesson: Lesson, progress: UserProgress) {

        this.lesson = lesson;
        this.progress = progress;

        this.stepIndex = progress.lessons[lesson.id]?.currentStep ?? 0;

    }

    public getCurrentStep(): LessonStep {

        return this.lesson.steps[this.stepIndex];

    }

    getInstruction(): string {

        return this.getCurrentStep().instructions;

    }

    public getGoals(): Goal[] {

        return this.getCurrentStep().goals ?? [];

    }

    public getLockedControls(): string[] {

        return this.getCurrentStep().lockedControls ?? [];

    }

    public saveProgress() {

        if (!this.progress.lessons[this.lesson.id]) {

            this.progress.lessons[this.lesson.id] = {
                lessonId: this.lesson.id,
                currentStep: 0,
                completedSteps: [],
                isComplete: false,
                updateAt: Date.now()
            };

        }

        const entry = this.progress.lessons[this.lesson.id];

        entry.currentStep = this.stepIndex;
        entry.completedSteps.push(this.stepIndex - 1);
        entry.updateAt = Date.now();

        if (this.iscomplete()) {

            entry.isComplete = true;
            
        }
    }
}

function evaluateGoals(goals: Goal[], state: any): boolean {

    return goals.every(goal => evaluateGoal(goal, state));
}

// example implementation
function evaluateGoal(goal: Goal, state: any): boolean {

    switch (goal.type) {

        case "reachValue": {

            const current = get(state, goal.target);

            switch (goal.condition) {

                // TODO: check if to add breaks and default case
                case "eq": return current === goal.value;
                case "gt": return current > goal.value;
                case "lt": return current < goal.value;
                case "gte": return current >= goal.value;
                case "lte": return current <= goal.value;;
            }
        }

        case "stateMatch":
            return matchObject(state, goal.matecher);

        case "stability":
            // MVP: skip or approximate
            return true;

        case "trajectory":
            // MVP skip
            return true;

        default:
            return false;

    }

}
