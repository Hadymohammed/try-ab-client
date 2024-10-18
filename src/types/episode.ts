// src/types/episode.ts
export interface Episode {
  id: number;
  titles: EpisodeTitleVariation[]; // Updated to support multiple titles
  duration: string;
  description: string;
  feature_flag_key?: string;
  feature_status?: "running" | "stopped";
  experiment_id?: string;
}

export interface EpisodeTitleVariation {
  variation_id: string;
  title: string;
}