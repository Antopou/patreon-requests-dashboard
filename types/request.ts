// Flexible types to match user's custom strings
export type Tier = string;
export type RequestType = string;
export type Status = string;
export type Priority = "High" | "Medium" | "Normal" | "Low";

export type RequestItem = {
  id: string;
  patreonName: string;
  tier: Tier;
  characterName: string;
  origin: string; // Anime / Origin
  requestType: RequestType;
  status: Status;
  priority: Priority;
  dateRequested: string; // ISO
  dateStarted?: string;  // ISO
  dateCompleted?: string; // ISO
  revisionCount: number;
  notes: string;
  details?: string;
  daysSinceRequest?: number; // Days since request was made
};

// Align with sheet statuses
export const STATUS: Status[] = ["Not Started", "In Progress", "Not Doing", "Waiting Feedback", "Done"];
export const TIERS: Tier[] = ["Tier 1", "Tier 2", "Tier 3", "Tier 4"];
export const TYPES: RequestType[] = ["Not Poll", "Poll"];
// export const PRIORITIES: Priority[] = ["High", "Medium", "Normal", "Low"];
