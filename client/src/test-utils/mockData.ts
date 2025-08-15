import type { ToolVaultIndex, Tool, ToolInput, ToolOutput } from '../types/index';

export const mockToolInput: ToolInput = {
  name: 'text',
  label: 'Text to analyse',
  type: 'string',
  required: true,
};

export const mockOptionalToolInput: ToolInput = {
  name: 'case_sensitive',
  label: 'Case Sensitive',
  type: 'boolean',
  required: false,
  default: false,
};

export const mockNumberToolInput: ToolInput = {
  name: 'max_length',
  label: 'Maximum Length',
  type: 'integer',
  required: false,
  default: 100,
};

export const mockToolOutput: ToolOutput = {
  name: 'word_count',
  label: 'Word count',
  type: 'integer',
};

export const mockStringToolOutput: ToolOutput = {
  name: 'processed_text',
  label: 'Processed Text',
  type: 'string',
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

export const mockComplexTool: Tool = {
  id: 'text-processor',
  name: 'Text Processor',
  description: 'Advanced text processing with multiple options and outputs.',
  category: 'Text Processing',
  tags: ['text', 'processing', 'advanced'],
  inputs: [mockToolInput, mockOptionalToolInput, mockNumberToolInput],
  outputs: [mockToolOutput, mockStringToolOutput],
};

export const mockDataTool: Tool = {
  id: 'data-analyzer',
  name: 'Data Analyzer',
  description: 'Analyzes data patterns and generates insights.',
  category: 'Data Analysis',
  tags: ['data', 'analysis', 'insights'],
  inputs: [
    {
      name: 'dataset',
      label: 'Dataset',
      type: 'string',
      required: true,
    }
  ],
  outputs: [
    {
      name: 'insights',
      label: 'Generated Insights',
      type: 'string',
    }
  ],
};

export const mockUtilityTool: Tool = {
  id: 'utility-helper',
  name: 'Utility Helper',
  description: 'General purpose utility functions.',
  category: 'Utilities',
  tags: ['utility', 'helper'],
  inputs: [
    {
      name: 'input_data',
      label: 'Input Data',
      type: 'string',
      required: true,
    }
  ],
  outputs: [
    {
      name: 'result',
      label: 'Result',
      type: 'string',
    }
  ],
};

export const mockToolVaultIndex: ToolVaultIndex = {
  name: 'ToolVault Test Index',
  version: '1.0.0',
  description: 'Test collection of analysis tools.',
  updated: '2025-01-15T12:00:00Z',
  tools: [mockTool, mockComplexTool, mockDataTool, mockUtilityTool],
};

export const mockLargeToolVaultIndex: ToolVaultIndex = {
  name: 'Large ToolVault Test Index',
  version: '1.0.0',
  description: 'Large test collection for performance testing.',
  updated: '2025-01-15T12:00:00Z',
  tools: Array.from({ length: 100 }, (_, index) => createMockTool({
    id: `tool-${index}`,
    name: `Test Tool ${index}`,
    description: `Test tool ${index} for performance testing.`,
    category: index % 2 === 0 ? 'Text Analysis' : 'Data Analysis',
    tags: [`tag-${index % 5}`, 'test'],
  })),
};

export function createMockTool(overrides?: Partial<Tool>): Tool {
  return {
    ...mockTool,
    ...overrides,
  };
}

export function createMockToolInput(overrides?: Partial<ToolInput>): ToolInput {
  return {
    ...mockToolInput,
    ...overrides,
  };
}

export function createMockToolOutput(overrides?: Partial<ToolOutput>): ToolOutput {
  return {
    ...mockToolOutput,
    ...overrides,
  };
}

export function createMockToolVaultIndex(overrides?: Partial<ToolVaultIndex>): ToolVaultIndex {
  return {
    ...mockToolVaultIndex,
    ...overrides,
  };
}

export function createMockTools(count: number): Tool[] {
  return Array.from({ length: count }, (_, index) => createMockTool({
    id: `mock-tool-${index}`,
    name: `Mock Tool ${index}`,
    description: `Mock tool ${index} for testing purposes.`,
    category: ['Text Analysis', 'Data Analysis', 'Utilities'][index % 3],
    tags: [`tag-${index % 3}`, 'mock', 'test'],
  }));
}

// Mock responses for network requests
export const mockNetworkResponses = {
  successResponse: {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: jest.fn().mockResolvedValue(mockToolVaultIndex),
  },
  errorResponse: {
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    json: jest.fn().mockRejectedValue(new Error('Failed to parse JSON')),
  },
  notFoundResponse: {
    ok: false,
    status: 404,
    statusText: 'Not Found',
    json: jest.fn().mockRejectedValue(new Error('Not found')),
  },
};