/**
 * Shared types used across the application.
 */

export interface Chapter {
  title?: string;
  chapterNumber?: number;
  content?: string;
  keyPoints?: string[];
}

export interface ComponentFix {
  issue?: string;
  fix?: string;
  example?: string;
  whereToAdd?: string;
}

export interface ComponentScore {
  name?: string;
  weight?: string;
  score?: number;
  present?: string[];
  missing?: string[];
  fixes?: ComponentFix[];
}

export interface PrioritizedFix {
  priority?: number;
  component?: string;
  issue?: string;
  fix?: string;
  impact?: string;
  bestseller_example?: string;
}

export interface DetectedGenre {
  id?: string;
  name?: string;
  confidence?: number;
  reasoning?: string;
  frameworkName?: string;
  provenBy?: string[];
}

export interface AnalysisResult {
  detectedGenre?: DetectedGenre;
  currentStructure?: {
    chapters?: Chapter[];
    totalChapters?: number;
    estimatedWordCount?: number;
  };
  componentScores?: Record<string, ComponentScore>;
  overallScore?: number;
  prioritizedFixes?: PrioritizedFix[];
  transformationSummary?: string;
}
