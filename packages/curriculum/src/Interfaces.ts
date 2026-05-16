
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

export type TopicID = string;

export type Topic = {
  id: TopicID;
  name: string;

  // Structure (tree)
  parent?: TopicID;
  children: TopicID[];

  // Graph (dependencies)
  dependsOn: TopicID[];

  // Classification
  subject: string;
  domain: string; // e.g. "mechanics", "algebra"

  // Content modeling (CRITICAL for your engine)
  concepts?: Concept[];
  equations?: Equation[];
  variables?: Variable[];

  systemType?: string;

  // Simulation hooks
  // simulation?: SimulationConfig;
  simulationId: string;

  // Metadata
  difficulty?: number; // 1–5
  tags?: string[];
}

export type Concept = {
  id: string;
  name: string;
  description?: string;
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
}

export type SimulationConfig = {
  type: "graph" | "system" | "interactive"

  inputs: string[];   // variable IDs
  outputs: string[];  // variable IDs

  manipulatable: string[]; // what user can change

  visualization: "2d" | "3d" | "graph";
}

// SimulationRegistry {
//   id: string
//   inputSchema
//   outputSchema
//   constraints
//   engineFunction
// }
