export interface OptimizationResult {
  revisedResume: string;
  matchScore: number;
  keyImprovements: string[];
  missingKeywords: string[];
  summary: string;
}

export interface JobSearchResponse {
  text: string;
  groundingChunks: any[];
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SEARCHING = 'SEARCHING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface UserInput {
  resumeText: string;
  resumeFile?: {
    data: string; // Base64 string
    mimeType: string;
    name: string;
  };
  jobDescription: string;
  jobDescriptionType: 'text' | 'link';
  jobDescriptionLink?: string;
  tone: 'Professional' | 'Enthusiastic' | 'Concise' | 'Executive';
  location: string;
  country: string;
  state: string;
}