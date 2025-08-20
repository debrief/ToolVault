// TypeScript interfaces for Phase 0 tool definitions

export interface ToolParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'enum';
  default: number | string | boolean;
  description: string;
  min?: number;
  max?: number;
  enum?: string[];
}

export interface ToolExample {
  name: string;
  description: string;
  parameters: Record<string, number | string | boolean>;
}

export interface ToolMetadata {
  id: string;
  commit: string;
  commit_date: string;
  name: string;
  labels: string[];
  description: string;
  input_types: string[];
  output_types: string[];
  isTemporal: boolean;
  parameters: ToolParameter[];
  examples: ToolExample[];
}

export interface ToolBundle {
  name: string;
  commit: string;
  commit_date: string;
  description: string;
  author: string;
  license: string;
  bundle_format: string;
  runtime: string;
  tools: ToolMetadata[];
}

export interface ToolRegistryEntry {
  metadata: ToolMetadata;
  loaded: boolean;
  lastError?: Error;
}

export interface ToolExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  executionTime: number;
}

// GeoJSON type definitions for tool inputs/outputs
export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}