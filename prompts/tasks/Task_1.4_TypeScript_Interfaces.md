# APM Task Assignment: Create TypeScript Interfaces from Schema

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 1, Task 1.4** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Define TypeScript interfaces based on the provided index.schema.json.

**Prerequisites:** Tasks 1.1-1.3 completed. The React TypeScript project should be set up with strict mode enabled.

## 2. Detailed Action Steps

1. **Analyze the JSON schema structure:**
   - Review `samples/index.schema.json` thoroughly
   - Review `samples/index.json` for example data
   - Identify all data types and their relationships:
     - Root object (ToolVaultIndex)
     - Tool objects with inputs/outputs
     - Input/Output parameter definitions
   - Note required vs optional fields for each type

2. **Create core type definitions:**
   - Create `client/src/types/index.ts` as the main type export file
   - Define interfaces matching the schema exactly:
     ```typescript
     // ToolVault Index root interface
     export interface ToolVaultIndex {
       name: string;
       version: string;
       description?: string;
       updated?: string; // ISO 8601 date-time string
       tools: Tool[];
     }
     
     // Individual tool interface
     export interface Tool {
       id: string;
       name: string;
       description: string;
       category?: string;
       tags?: string[];
       inputs: ToolInput[];
       outputs: ToolOutput[];
     }
     
     // Input parameter interface
     export interface ToolInput {
       name: string;
       label?: string;
       type: InputType;
       required?: boolean;
     }
     
     // Output parameter interface
     export interface ToolOutput {
       name: string;
       label?: string;
       type: OutputType;
     }
     ```
   - Create type unions for input/output types:
     ```typescript
     export type InputType = 'string' | 'number' | 'integer' | 'boolean' | 'geojson' | 'file';
     export type OutputType = 'string' | 'number' | 'integer' | 'boolean' | 'geojson' | 'file' | 'image';
     ```
   - Add any additional utility types needed

3. **Implement type guards and validators:**
   - Create `client/src/utils/typeGuards.ts`:
     ```typescript
     import { Tool, ToolInput, ToolOutput, ToolVaultIndex } from '@types/index';
     
     export function isToolVaultIndex(data: unknown): data is ToolVaultIndex {
       // Implementation to validate the structure
     }
     
     export function isTool(data: unknown): data is Tool {
       // Implementation to validate tool structure
     }
     ```
   - Create `client/src/utils/validators.ts` for runtime validation:
     - Implement JSON schema validation using the actual schema file
     - Create validation functions that return detailed error messages
     - Consider using a library like `ajv` for JSON schema validation:
       ```bash
       pnpm add ajv
       ```

4. **Generate mock data factories:**
   - Create `client/src/test-utils/factories.ts`:
     ```typescript
     import { Tool, ToolInput, ToolOutput, ToolVaultIndex } from '@types/index';
     
     export function createMockToolVaultIndex(overrides?: Partial<ToolVaultIndex>): ToolVaultIndex {
       // Factory function that generates valid test data
     }
     
     export function createMockTool(overrides?: Partial<Tool>): Tool {
       // Factory function for individual tools
     }
     
     export function createMockToolInput(overrides?: Partial<ToolInput>): ToolInput {
       // Factory function for inputs
     }
     ```
   - Ensure factories respect all schema constraints
   - Generate realistic test data based on the sample index.json

## 3. Expected Output & Deliverables

**Success Criteria:**
- TypeScript interfaces exactly match the JSON schema
- Type guards provide runtime type safety
- Validators can check data against the schema
- Mock factories generate valid test data
- No TypeScript errors in strict mode

**Deliverables:**
1. `types/index.ts` with all interfaces and type definitions
2. `utils/typeGuards.ts` with type predicate functions
3. `utils/validators.ts` with runtime validation
4. `test-utils/factories.ts` with mock data generators
5. All exports properly configured for use throughout the app

## 4. Memory Bank Logging Instructions

**Instruction:** Log your work to:
`Memory/Phase_1_Project_Setup_Infrastructure/Task_1.4_TypeScript_Interfaces_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_Setup_Specialist)
- Task reference (Phase 1 / Task 1.4)
- List of created interfaces and types
- Validation approach chosen
- Any schema interpretation decisions made
- Confirmation that types work with strict mode

## 5. Additional Context

**Important Schema Considerations:**
- The `updated` field uses ISO 8601 date-time format
- Input/output types are constrained to specific values
- The `required` field on inputs defaults to false when not specified
- Consider future extensibility when designing the types

## 6. Clarification Instruction

If you need clarification on:
- Schema interpretation
- Additional type requirements
- Validation library preferences

Please ask before proceeding. Acknowledge receipt and proceed with implementation.