# ToolVault Tool Modules

This directory contains the real tool modules that can be dynamically imported and executed by the ToolVault application.

## Tool Module Structure

Each tool module must follow these conventions:

### 1. Module Export Structure

Every tool module must export a default function called `run` with the following signature:

```typescript
export interface ToolRunFunction<TInput = any, TOutput = any> {
  (input: TInput): Promise<TOutput> | TOutput;
}

export default run;
```

### 2. Input/Output Types

- **Input**: Must match the parameters defined in `index.json` for the tool
- **Output**: Must match the outputs defined in `index.json` for the tool
- All types should be well-defined and documented

### 3. Error Handling

Tools should handle errors gracefully:

```typescript
export default async function run(input: InputType): Promise<OutputType> {
  try {
    // Tool logic here
    return result;
  } catch (error) {
    throw new Error(`Tool execution failed: ${error.message}`);
  }
}
```

### 4. File Structure

```
src/tools/
├── word-count/
│   ├── index.ts          # Main tool implementation
│   ├── types.ts          # Input/output type definitions
│   └── __tests__/
│       └── index.test.ts # Unit tests
├── change-color-to-red/
│   ├── index.ts
│   ├── types.ts
│   └── __tests__/
│       └── index.test.ts
└── README.md             # This file
```

### 5. TypeScript Configuration

Tools are compiled as ES modules for dynamic import compatibility:

- Source files are in TypeScript (`.ts`)
- Compiled output goes to the same directory structure
- Vite handles the build process automatically

### 6. Registration in index.json

Each tool must be registered in the `public/data/index.json` file:

```json
{
  "id": "word-count",
  "name": "Word Count",
  "description": "Count words in text",
  "category": "text-processing",
  "module": "/src/tools/word-count/index.ts",
  "inputs": [
    {
      "name": "text",
      "label": "Input Text",
      "type": "string",
      "required": true
    }
  ],
  "outputs": [
    {
      "name": "count",
      "label": "Word Count",
      "type": "number"
    }
  ]
}
```

### 7. Testing Requirements

Each tool should include:

- Unit tests covering main functionality
- Edge case testing
- Input validation testing
- Error handling testing

### 8. Documentation

Each tool directory should include:

- Clear documentation of purpose and usage
- Input/output specifications
- Example usage
- Any dependencies or limitations

## Example Implementation

See the `word-count` and `change-color-to-red` tools in this directory for reference implementations.