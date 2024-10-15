// src/types/episode.ts
export interface Episode {
  id: number;
  titles: string[]; // Updated to support multiple titles
  duration: string;
  description: string;
  feature_flag_key?: string;
  feature_status?: "enabled" | "disabled";
}
