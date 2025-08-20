import type { ToolBundle, ToolMetadata, ToolParameter } from '../types/tools';

export interface ParsedMetadata {
  bundle: ToolBundle;
  categories: string[];
  runtimeTypes: string[];
  parameterTypes: string[];
}

export class MetadataParser {
  parseBundle(bundle: ToolBundle): ParsedMetadata {
    const categories = new Set<string>();
    const runtimeTypes = new Set<string>();
    const parameterTypes = new Set<string>();

    // Extract categories from tool labels
    for (const tool of bundle.tools) {
      for (const label of tool.labels) {
        categories.add(label);
      }
      
      // Extract parameter types
      for (const param of tool.parameters) {
        parameterTypes.add(param.type);
      }
    }

    // Add bundle runtime
    if (bundle.runtime) {
      runtimeTypes.add(bundle.runtime);
    }

    return {
      bundle,
      categories: Array.from(categories).sort(),
      runtimeTypes: Array.from(runtimeTypes).sort(),
      parameterTypes: Array.from(parameterTypes).sort(),
    };
  }

  validateMetadata(bundle: ToolBundle): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required bundle fields
    if (!bundle.name) errors.push('Bundle missing name');
    if (!bundle.tools || !Array.isArray(bundle.tools)) {
      errors.push('Bundle missing tools array');
      return { valid: false, errors };
    }

    // Validate each tool
    for (const tool of bundle.tools) {
      const toolErrors = this.validateTool(tool);
      errors.push(...toolErrors.map(error => `Tool ${tool.id}: ${error}`));
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private validateTool(tool: ToolMetadata): string[] {
    const errors: string[] = [];

    // Required fields
    if (!tool.id) errors.push('missing id');
    if (!tool.name) errors.push('missing name');
    if (!tool.description) errors.push('missing description');
    if (!tool.labels || !Array.isArray(tool.labels)) {
      errors.push('missing or invalid labels array');
    }
    if (!tool.parameters || !Array.isArray(tool.parameters)) {
      errors.push('missing or invalid parameters array');
    }

    // Validate parameters
    if (tool.parameters) {
      for (let i = 0; i < tool.parameters.length; i++) {
        const param = tool.parameters[i];
        const paramErrors = this.validateParameter(param);
        errors.push(...paramErrors.map(error => `parameter[${i}] ${error}`));
      }
    }

    return errors;
  }

  private validateParameter(param: ToolParameter): string[] {
    const errors: string[] = [];

    if (!param.name) errors.push('missing name');
    if (!param.type) errors.push('missing type');
    if (!['number', 'string', 'boolean', 'enum'].includes(param.type)) {
      errors.push(`invalid type: ${param.type}`);
    }
    if (param.default === undefined) errors.push('missing default value');
    if (!param.description) errors.push('missing description');

    // Enum-specific validation
    if (param.type === 'enum' && (!param.enum || !Array.isArray(param.enum))) {
      errors.push('enum type requires enum array');
    }

    // Number-specific validation
    if (param.type === 'number') {
      if (param.min !== undefined && param.max !== undefined && param.min > param.max) {
        errors.push('min value cannot be greater than max value');
      }
    }

    return errors;
  }

  getToolComplexity(tool: ToolMetadata): 'simple' | 'medium' | 'complex' {
    const paramCount = tool.parameters.length;
    const hasComplexParams = tool.parameters.some(p => 
      p.type === 'enum' || (p.min !== undefined && p.max !== undefined)
    );
    const isMultiInputOutput = tool.input_types.length > 1 || tool.output_types.length > 1;

    if (paramCount <= 2 && !hasComplexParams && !isMultiInputOutput) {
      return 'simple';
    } else if (paramCount <= 5 && !isMultiInputOutput) {
      return 'medium';
    } else {
      return 'complex';
    }
  }

  extractSearchableText(tool: ToolMetadata): string {
    return [
      tool.name,
      tool.description,
      ...tool.labels,
      ...tool.parameters.map(p => `${p.name} ${p.description}`),
      ...tool.input_types,
      ...tool.output_types,
    ].join(' ').toLowerCase();
  }
}

export const metadataParser = new MetadataParser();