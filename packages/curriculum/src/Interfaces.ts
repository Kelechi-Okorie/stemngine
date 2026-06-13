
// The Real Insight

// This schema lets you do:
// dependency resolution ✅
// simulation generation ✅
// adaptive learning ✅
// automatic visualization mapping ✅

// You’re not building notes.
// You’re building:
// a computable representation of STEM knowledge

// Unique ID strategy: subject.domain.concept
// e.g. physics.mechanics.velocity

export type ConceptID = string;

export type BaseArtifact = {
  id: string;
  type: "concept" | "lesson" | "build" | "scene";
  version?: string;
};

/**
 * layer 1: Knowledge graph
 */
export type ConceptNode = BaseArtifact & {
  name: string;

  // Structure (tree)
  parent?: ConceptID;
  children: ConceptID[];

  // Graph (dependencies)
  dependsOn: ConceptID[];

  // Classification
  subject: string;
  domain: string; // e.g. "mechanics", "algebra"

  variables?: Variable[];
  equations?: Equation[];

  // Metadata
  difficulty?: number; // 1–5
  tags?: string[];

  kind: "theoretical" | "computational" | "composite";
}

export type Variable = {
  id: string;
  name: string;
  symbol: string;
  unit?: string;
}

export type Equation = {
  id: string;
  latex: string;
  variables: string[]; // references Variable.id
  compute?: string; // or AST
}

export type SimulationConfig = {
  type: "graph" | "system" | "interactive"

  inputs: string[];   // variable IDs
  outputs: string[];  // variable IDs

  manipulatable: string[]; // what user can change

  visualization: "2d" | "3d" | "graph";
}

/**
 * layer2: concept runtime.
 * 
 * answers how does this concept execute
 */
export type ConceptRuntime = BaseArtifact & {
  // id: string; // matches ConceptID

  engineSceneId: string;

  bindings: Binding[];

  visualization: VisualizationConfig;

  behaviours?: ScriptRef[];
}

export type VisualizationConfig = {
  mode: "2d" | "3d" | "graph" | "ui" | "hybrid";

  /**
   * What entities/variables are visualized
   */
  targets: VisualTarget[];

  /**
   * How they are visually represented
   */
  representations: VisualizationRepresentation[];

  /**
   * Optional overlays (debug, pedagogy, analytics)
   */
  overlays?: VisualizationOverlay[];

  /**
   * Layout strategy (especially for UI + hybrid mode)
   */
  layout?: LayoutConfig;
};

export type VisualTarget = {
  variableId?: string;     // preferred
  entityPath?: string;     // fallback for engine state

  label?: string;
};

export type VisualizationRepresentation =
  | {
    type: "point";
    style?: PointStyle;
  }
  | {
    type: "vector";
    style?: VectorStyle;
  }
  | {
    type: "curve";
    style?: CurveStyle;
  }
  | {
    type: "field";
    style?: FieldStyle;
  }
  | {
    type: "plot";
    style?: PlotStyle;
  };

export type BaseStyle = {
  visible?: boolean;

  color?: string;

  opacity?: number;

  scale?: number;

  label?: {
    enabled?: boolean;
    format?: string;
  };
};

export type PointStyle = BaseStyle & {
  shape?: "circle" | "square" | "dot" | "sphere";

  size?: number;

  pulse?: boolean;

  trail?: {
    enabled: boolean;
    length?: number;
  };

  glow?: boolean;
};

export type VectorStyle = BaseStyle & {
  arrowHead?: boolean;

  thickness?: number;

  origin?: "entity" | "fixed" | "offset";

  normalize?: boolean;

  scaleByMagnitude?: boolean;

  tail?: {
    enabled: boolean;
    style?: "line" | "faded";
  };
};

export type CurveStyle = BaseStyle & {
  lineWidth?: number;

  smoothing?: number;

  dashed?: boolean;

  interpolation?: "linear" | "bezier" | "catmull-rom";

  samplingRate?: number;

  fadeByAge?: boolean;

  animation?: {
    speed?: number;
    flow?: boolean;
  };
};

export type FieldStyle = BaseStyle & {
  resolution?: number;

  density?: number;

  representation?: "arrows" | "streamlines" | "heatmap";

  arrowScale?: number;

  contourLines?: boolean;

  normalization?: "absolute" | "relative";

  fadeDistance?: number;
};

export type PlotStyle = BaseStyle & {
  chartType: "line" | "scatter" | "bar" | "area";

  xAxis: {
    label?: string;
    scale?: "linear" | "log";
  };

  yAxis: {
    label?: string;
    scale?: "linear" | "log";
  };

  grid?: boolean;

  smooth?: boolean;

  showPoints?: boolean;

  fill?: boolean;
};

export type VisualizationOverlay =
  | { type: "grid" }
  | { type: "axes" }
  | { type: "labels" }
  | { type: "trails" }
  | { type: "debug_vectors" };

export type LayoutConfig = {
  type: "free" | "split" | "panelled";

  regions?: {
    viewport: string;
    inspector?: string;
    controls?: string;
  };
};

export type ScriptRef = {
  id: string;

  trigger: ScriptTrigger;

  scope: ScriptScope;

  effect: ScriptEffect;
};

export type ScriptTrigger =
  | { type: "onInit" }
  | { type: "onUpdate" }
  | { type: "onParameterChange"; variableId: string }
  | { type: "onEvent"; eventId: string };

export type ScriptScope = {
  variables?: string[];
  entities?: string[];
  solvers?: string[];
};

export type ScriptEffect =
  | { type: "setVariable"; variableId: string; value: number }
  | { type: "applyForce"; entityId: string; value: [number, number, number] }
  | { type: "modifySolver"; solverId: string; patch: Record<string, any> }
  | { type: "emitEvent"; eventId: string }
  | { type: "runExpression"; expression: string };

/**
 * layer 3: scene (engine layer)
 * 
 * from the engine export json
 * 
 * @remarks
 * - no knowledge here
 * - no pedagogy here
 * 
 * {
 *  "id": "scene.gravity.basic",
 *  "systems": [...],
 *  "solvers": [...]
 * }
*/

/**
 * layer 4: experience layer (lesson / build).
 * 
 * the user-facing system
 */
export type Lesson = BaseArtifact & {
  // id: string;

  steps: LessonStep[];
}

type LessonStep = {
  conceptId: string;

  instructions: string;

  lockedControls?: string[];

  goals?: Goal[];
}

export type Build = BaseArtifact & {
  // id: string;

  title: string;

  baseSceneId: string;

  allowedConcepts: string[];

  successCriteria: Goal[];

  constraints?: Constraint[];
}

export type Goal =
  | {
    type: "reachValue";
    target: string; // variable or path
    condition: "eq" | "gt" | "lt" | "gte" | "lte";
    value: number;
  }
  | {
    type: "stateMatch";
    matcher: Record<string, any>;
  }
  | {
    type: "stability";
    variableId: string;
    tolerance: number;
    duration: number;
  }
  | {
    type: "trajectory";
    description: string;
    evaluate: string; // expression or function id
  };

export type Constraint =
  | {
    type: "range";
    target: string; // variable or path
    min?: number;
    max?: number;
  }
  | {
    type: "noExplode";
    variableId: string;
    threshold: number;
  }
  | {
    type: "boundedEnergy";
    maxEnergy: number;
  }
  | {
    type: "rateLimit";
    variableId: string;
    maxDeltaPerSecond: number;
  }
  | {
    type: "custom";
    expression: string;
  };

/**
 * a way to connect equations -> simulation -> UI
 * 
 * example
 * {
 *  "variableId": "g",
 *  "targetPath": "solvers.gravity.gravity[1]"
 * }
 * 
 * this will allow
 *  sliders -> engine
 *  engine -> simulation
 *  lessons -> control system
 */
type Binding = {
  variableId: string; // from Topic
  targetPath: string;
}





export type Registry = Map<string, Artifact>;

export type Artifact =
  | ConceptNode
  | ConceptRuntime
  | Lesson
  | Build
;

export type ConceptGraphView = {
  getDependencies(id: ConceptID): ConceptID[];
  getChildren(id: ConceptID): ConceptID[];
};

export type LessonView = {
  getSteps(lessonId: string): LessonStep[];
};

export type BuildView = {
  getGoal(buildId: string): Goal[];
  getConstraints(buildId: string): Constraint[];
};

/**
 * how everything connects
 */
// [ Knowledge Graph ]
//     topics
//     variables
//     equations

//         ↓ (linked by ID)

// [ Concept Runtime ]
//     bindings
//     behaviors
//     visualization

//         ↓

// [ Scene ]
//     entities
//     solvers

//         ↓

// [ Engine ]
//     executes simulation

// ----------------------------

// [ Experience Layer ]
//     lessons
//     builds

//         ↓

// [ UI Modes ]
//     explore / learn / build
