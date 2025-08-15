import type { ToolVaultIndex, Tool, ToolInput, ToolOutput } from '../types/index';

export const mockToolInput: ToolInput = {
  name: 'text',
  label: 'Text to analyse',
  type: 'string',
  required: true,
};

export const mockToolOutput: ToolOutput = {
  name: 'word_count',
  label: 'Word count',
  type: 'integer',
};

export const mockTool: Tool = {
  id: 'wordcount',
  name: 'Word Count',
  description: 'Counts the number of words, characters, and sentences in text.',
  category: 'Text Analysis',
  tags: ['text', 'analysis', 'count'],
  inputs: [mockToolInput],
  outputs: [mockToolOutput],
};

export const mockToolVaultIndex: ToolVaultIndex = {
  name: 'ToolVault Test Index',
  version: '1.0.0',
  description: 'Test collection of analysis tools.',
  updated: '2025-01-15T12:00:00Z',
  tools: [mockTool],
};

export function createMockTool(overrides?: Partial<Tool>): Tool {
  return {
    ...mockTool,
    ...overrides,
  };
}

export function createMockToolVaultIndex(overrides?: Partial<ToolVaultIndex>): ToolVaultIndex {
  return {
    ...mockToolVaultIndex,
    ...overrides,
  };
}