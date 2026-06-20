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


export type BaseArtifact = {
  id: string;
  type: "concept" | "lesson" | "build" | "scene";
  version?: string;

  relationships?: Relationship[]

  aliases?: string[];
  displayName?: string;
};

/**
 * layer 1: Knowledge graph
 */
export type Concept = BaseArtifact & {
  name: string;

  relationships: Relationship[],

  // Structure (tree)
  parent?: string;
  children: string[];

  // Graph (dependencies)
  dependsOn: string[];

  // Classification
  subject: string;
  domain: string; // e.g. "mechanics", "algebra"

  variables?: Variable[];
  equations?: Equation[];

  // Metadata
  difficulty?: number; // 1–5
  tags?: string[];

  kind: "theoretical" | "computational" | "composite";
};


type ConceptRelationshipType =
  | "prerequisite"
  | "belongs_to"
  | "related"
  | "part_of"
  | "derived_from"
  | "depends_on"
  ;

type ExploreRelationshipType =
  | "demonstrates"
  | "visualizes"
  | "extends"
  | "compares_with"
  ;

type LessonRelationshipType =
  | "teaches"
  | "introduces"
  | "reinforces"
  | "requires"
  ;

type BuildRelationshipType =
  | "uses"
  | "combines"
  | "challenges"
  | "applies"
  ;

export type BaseRelationship = {
  from: string;
  to: string;
  
  // type = meaning
  type: string; // semantic meaning (depends_on, teaches, applies)
  // scope = interpretation layer
  scope: "concept" | "explore" | "lesson" | "build" | "crosses";
  
  // metadata = tuning parameters
  metadata?: {
    weight?: number;
    intent?: string;
    difficultyDelta?: number;
    visualHint?: number;
    role?: string;
  };

  // Build a “Graph query engine for STEMngine”
  // so you can answer:
  // what should a student see next?
  // which explores explain this concept best?
  // which lesson prepares for this build?

  // That’s the point where your system becomes intelligent rather than just structured.
};


type ConceptRelationship = BaseRelationship & { type: ConceptRelationshipType; };
type ExploreRelationship = BaseRelationship & { type: ExploreRelationshipType; };
type LessonRelationship = BaseRelationship & { type: LessonRelationshipType; };
type BuildRelationship = BaseRelationship & { type: BuildRelationshipType; };

export type Relationship =
  | ConceptRelationship
  | ExploreRelationship
  | LessonRelationship
  | BuildRelationship
  ;

  export type Edge = Relationship;

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
  conceptId: string;

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
  | { type: "runExpression"; expression: string }
  ;

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
  conceptId: string;

  steps: LessonStep[];
}

type LessonStep = {
  id: string;
  conceptId: string;  // may be removed
  string: string;

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

export type Explore = BaseArtifact & {
  title: string;  // either name or title is removed
  description?: string;
  conceptId: string;
  runtimeId: string;
  baseSceneId: string;
  // override or filter observations
  observations: Observation[];
  controls: ControlConfig[];
  constraints?: Constraint[];

  order?: number;

  // optional UI hints
  ui?: UIConfig;
};



export type Artifact =
  | Concept
  | ConceptRuntime
  | Lesson
  | Build
  | Explore
  ;

export type ConceptGraphView = {
  getDependencies(id: string): string[];
  getChildren(id: string): string[];
};

export type LessonView = {
  getSteps(lessonId: string): LessonStep[];
};

export type BuildView = {
  getGoal(buildId: string): Goal[];
  getConstraints(buildId: string): Constraint[];
};

export type Observation = {
  id: string;

  // engine state path OR derived field
  source: string;

  projection: ProjectionType;
  transform?: TransformPipeline;
  visualizaiton: VisualizationSpec;
}

export type ProjectionType =
  | "raw"           // direct state
  | "derived"       // computed (flow rate, pressue)
  | "aggregate"     // region-based (organ-level metrics)
  | "signal"        // time series (ECG, EEG)
  | "field"         // spatial field (pressure map)
  | "graph"         // abstract relationships
  ;

// asset could be driven by a deformation model that is mapped
// from simulation state variables
export type Asset = {
  type: "mesh" | "gltf" | "texture" | "material";
  id: string;
  name: string;

  uri: string;  // CDN OR local path

  metadata?: {
    scale?: number;
    coordinateSystem?: "y-up" | "z-up";
  };
};

export type DeformationModel = {
  type: "rigid" | "skeletal" | "custom";

  // e.g. ["activationField", "pressureField"]
  source: string[];

  apply: DeformationRule[];
};

export type DeformationRule =
  | {
    type: "translate";
    from: string;
    to: string;
  }
  | {
    type: "boneTransform";
    boneId: string;
    driver: string
  }
  | {
    type: "vertexShader",
    shaderId: string;
    uniforms: Record<string, string>
  }
  | {
    type: "fem";
    stiffnessField: string;
    pressureField: string;
  }
  ;

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



// An explore is:
// How should the user interact with this concept right now?
// a specific lens on a concept that reveals one core property
// So each explore must answer:
// “What does this reveal about velocity that others don’t?”
// e.g. conceptId.explore.<focus>

// Each explore should differ ONLY in:
// - observations
// - controls
// - constraints

// e.g.
// physics.mechanics.velocity
//    ├── explores (5)
//    ├── lessons (3–6)
//    └── builds (3–5)

// A strong constraint you should enforce
// Every explore must answer:
// “If I remove this explore, what understanding is lost?”
// If answer = “nothing” → delete it.

// Explore is a thin, declarative layer that configures how a ConceptRuntime is exposed to the user for open-ended interaction.

// Concept → what it is
// Runtime → how it behaves
// Explore → how user plays with it
// Lesson → how user is guided
// Build → how user applies it
