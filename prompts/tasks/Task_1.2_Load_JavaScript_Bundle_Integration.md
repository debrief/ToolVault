# APM Task Assignment: Load Standard Bundle from Phase 0

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to `Phase 1, Task 1.2` in the [Implementation_Plan.md](../../Implementation_Plan.md).

**Objective:** Integrate the JavaScript toolbox created in Phase 0 as the standard tool bundle for the React frontend.

**Detailed Action Steps:**

1. **Create bundle loading service**
   - Reference `/examples/javascript-bundle/index.json` as the primary bundle source
   - Implement `src/services/bundleLoader.ts` to fetch and parse tool metadata from Phase 0
   - Create TypeScript interfaces in `src/types/tools.ts` matching Phase 0 tool definitions:
     - Interface for tool metadata structure from `index.json`
     - Parameter schema interfaces (number, string, boolean, enum types)
     - Input/output type definitions (Feature, FeatureCollection, etc.)
   - Handle loading errors with fallback mechanisms and user-friendly error messages
   - Support both development (local file) and production (bundled) loading scenarios

2. **Implement tool registry system**
   - Create `src/services/toolRegistry.ts` for in-memory registry of Phase 0 bundle tools
   - Implement filtering capabilities by:
     - Category (Transform, Analysis, Statistics, Processing, I/O - note: these should not be hard-coded,  but derivte  from the metadata)
     - Runtime type ("javascript")
     - Search terms across tool names and descriptions
   - Implement tool metadata caching for performance optimization
   - Add tool availability status tracking and health checks
   - Create methods for: `getTools()`, `getToolById()`, `getToolsByCategory()`, `searchTools()`

3. **Load Phase 0 JavaScript tools**
   - Implement dynamic script loading in `src/services/scriptLoader.ts` using IIFE pattern from Phase 0
   - Verify tool function availability in `window.ToolVault.tools` namespace after loading
   - Handle script loading errors gracefully with retry mechanisms
   - Test integration with all 12 tools from Phase 0:
     - Transform: translate, flip-horizontal, flip-vertical
     - Analysis: speed-series, direction-series  
     - Statistics: average-speed, speed-histogram
     - Processing: smooth-polyline
     - I/O: import-rep, export-rep, export-csv
   - Create tool execution wrapper with error handling and validation

**Provide Necessary Context/Assets:**
- Phase 0 tools are implemented using IIFE pattern and register in `window.ToolVault.tools` namespace
- The `examples/javascript-bundle/index.json` contains complete metadata with runtime field = "javascript"
- All Phase 0 tools expect specific input formats: GeoJSON Feature/FeatureCollection, LineString, etc.
- Phase 0 tools include comprehensive parameter schemas with defaults and validation rules
- Reference ADR-013 for JavaScript tool implementation specification

## 2. Expected Output & Deliverables

**Define Success:** A fully functional bundle loading system that can dynamically load and execute all Phase 0 JavaScript tools from the frontend.

**Specify Deliverables:**
- `src/services/bundleLoader.ts` - Bundle metadata loading service
- `src/services/toolRegistry.ts` - Tool registry and filtering system  
- `src/services/scriptLoader.ts` - Dynamic script loading for IIFE tools
- `src/types/tools.ts` - TypeScript interfaces for Phase 0 tool structure
- Successful loading and execution test of all 12 Phase 0 tools
- Error handling for bundle loading failures
- Tool availability verification system

## 3. Memory Bank Logging Instructions

Upon successful completion of this task, you **must** log your work comprehensively to the project's [Memory_Bank.md](../../Memory_Bank.md) file. Adhere strictly to the established logging format. Ensure your log includes:
- A reference to Phase 1, Task 1.2 in the Implementation Plan
- A clear description of the bundle integration implementation
- Key decisions made for tool loading architecture
- Any challenges encountered with Phase 0 tool integration
- Confirmation of successful execution (all 12 Phase 0 tools loading and executing correctly)

## 4. Clarification Instruction

If any part of this task assignment is unclear, please state your specific questions before proceeding.