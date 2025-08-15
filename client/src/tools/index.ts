/**
 * ToolVault Tool Modules Index
 * 
 * This file provides a registry of available tool modules for type checking and development.
 * Note: Actual tool loading is done dynamically via import() based on index.json configuration.
 */

export * from './types';

// Tool registry for development and type checking
export const AVAILABLE_TOOLS = {
  'word-count': () => import('./word-count/index'),
  'change-color-to-red': () => import('./change-color-to-red/index'),
} as const;

export type AvailableToolIds = keyof typeof AVAILABLE_TOOLS;