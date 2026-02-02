
export interface ReasoningState {
  assumptions: string[];
  intent: string[];
  constraints: string[];
  anchors: string[];
  conclusions: string[];
  driftDetected: DriftItem[];
}

export interface DriftItem {
  type: 'contradiction' | 'shift' | 'divergence' | 'forgotten_constraint' | 'anchor_violation';
  message: string;
  context: string;
  violatedAnchor?: string; // The exact text of the anchor that was violated
}

export interface Snapshot {
  id: string;
  timestamp: number;
  content: string;
  state: ReasoningState;
  changeSummary: string;
}

export interface FileEntry {
  id: string;
  timestamp: number;
  filename: string;
  content: string;
  status: 'coherent' | 'contradiction' | 'unresolved';
  contradictsWith?: string; // Descriptive string about what it contradicts
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
  lastActive: number;
  files: FileEntry[];
  state: ReasoningState;
  history: Snapshot[];
}
