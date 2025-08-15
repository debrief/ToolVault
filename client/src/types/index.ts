/* tslint:disable */
/**
 * This file was automatically generated from index.schema.json.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run 'pnpm generate-types' to regenerate this file.
 */

/**
 * Schema for ToolVault's tool index file
 */
export interface ToolVaultIndex {
  /**
   * Name of the tool collection
   */
  name: string;
  /**
   * Version of this index (semantic versioning recommended)
   */
  version: string;
  /**
   * Description of the tool collection
   */
  description?: string;
  /**
   * Last update timestamp in ISO 8601 format
   */
  updated?: string;
  /**
   * List of tools in this collection
   */
  tools: {
    /**
     * Unique identifier for the tool
     */
    id: string;
    /**
     * Human-readable name of the tool
     */
    name: string;
    /**
     * Description of the tool
     */
    description: string;
    /**
     * Optional category for grouping tools
     */
    category?: string;
    /**
     * Keywords for searching/filtering
     */
    tags?: string[];
    /**
     * Input parameters for the tool
     */
    inputs: {
      /**
       * Internal parameter name
       */
      name: string;
      /**
       * Human-readable label for UI
       */
      label?: string;
      /**
       * Data type (e.g., string, number, geojson)
       */
      type: string;
      required?: boolean;
    }[];
    /**
     * Output fields produced by the tool
     */
    outputs: {
      /**
       * Internal output name
       */
      name: string;
      /**
       * Human-readable label for UI
       */
      label?: string;
      /**
       * Data type (e.g., string, number, geojson)
       */
      type: string;
    }[];
  }[];
}

// Additional type aliases for convenience
export type Tool = ToolVaultIndex['tools'][number];
export type ToolInput = Tool['inputs'][number];  
export type ToolOutput = Tool['outputs'][number];

// Type guards for runtime validation
export function isToolVaultIndex(data: unknown): data is ToolVaultIndex {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'version' in data &&
    'tools' in data &&
    typeof (data as any).name === 'string' &&
    typeof (data as any).version === 'string' &&
    Array.isArray((data as any).tools)
  );
}

export function isTool(data: unknown): data is Tool {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'description' in data &&
    'inputs' in data &&
    'outputs' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).name === 'string' &&
    typeof (data as any).description === 'string' &&
    Array.isArray((data as any).inputs) &&
    Array.isArray((data as any).outputs)
  );
}
