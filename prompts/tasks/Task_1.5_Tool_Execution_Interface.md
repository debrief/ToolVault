# APM Task Assignment: Dynamic Input Forms and Output Renderers

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to `Phase 1, Task 1.5` in the [Implementation_Plan.md](../../Implementation_Plan.md).

**Objective:** Create the execution interface that works with Phase 0 tool specifications, enabling users to run tools with proper input handling and output display.

**Detailed Action Steps:**

1. **Build tool execution page**
   - Create `src/pages/ToolExecution.tsx` main execution interface:
     - Display selected tool information and dynamically generated parameter forms
     - Integrate sample data selection from Phase 0 for quick testing
     - Implement real-time parameter validation based on Phase 0 schemas
     - Add execute button with loading states, progress indication, and cancellation
   - Implement `src/components/InputSelection/` components:
     - `InputDataSelector.tsx` - Choose between file upload, sample data, or manual input
     - `SampleDataPicker.tsx` - Select from Phase 0 sample data (sample-track.geojson, sample-features.geojson)
     - `FileUploader.tsx` - Handle GeoJSON, JSON, and text file uploads
     - `DataPreview.tsx` - Preview input data before tool execution
   - Add input validation matching Phase 0 tool input_types requirements
   - Support routing from tool browser with tool ID parameter

2. **Implement JavaScript tool execution engine**
   - Create `src/services/toolExecutor.ts` execution service:
     - Execute Phase 0 tools using `window.ToolVault.tools[toolId](input, params)` pattern
     - Handle synchronous tool execution with proper error catching and timeout
     - Support different input types from Phase 0: Feature, FeatureCollection, Point, LineString, Polygon
     - Implement execution logging and performance monitoring
   - Add comprehensive error handling:
     - Parameter validation errors with specific field feedback
     - Tool execution errors with user-friendly messages
     - Input format validation and conversion errors
     - Timeout handling for long-running operations
   - Support execution cancellation and cleanup

3. **Create results display system**
   - Develop `src/components/ExecutionResults/` result display system:
     - `ResultsContainer.tsx` - Multi-tab input/output viewer container
     - `RawOutput.tsx` - Raw JSON/text output with syntax highlighting
     - `FormattedOutput.tsx` - Structured display for specific output types
     - `DownloadOutput.tsx` - File download functionality for string outputs
   - Support Phase 0 tool input/output types:
     - GeoJSON (Feature, FeatureCollection) with formatted JSON display
     - JSON objects and arrays with collapsible tree structures
     - String outputs (CSV, REP format) with proper formatting
     - Array outputs (time series) with tabular display
   - Prepare spatial output tab placeholder for LeafletJS integration (Task 2.1)
   - Add execution metadata display: execution time, tool version, parameter summary
   - Implement output comparison functionality for multiple executions
   - Support output export and sharing capabilities

**Provide Necessary Context/Assets:**
- Phase 0 sample data files: `examples/javascript-bundle/data/sample-track.geojson`, `sample-features.geojson`
- All Phase 0 tools expect specific input formats defined in their input_types metadata
- Tools return diverse outputs: GeoJSON objects, JSON arrays, formatted strings
- Phase 0 tools are synchronous and execute in browser context via window.ToolVault.tools
- Execution interface must handle all 12 Phase 0 tools with their unique parameter requirements

## 2. Expected Output & Deliverables

**Define Success:** A complete tool execution interface that allows users to run any Phase 0 tool with appropriate inputs and view results in multiple formats.

**Specify Deliverables:**
- `src/pages/ToolExecution.tsx` - Main tool execution page
- `src/components/InputSelection/` - Complete input handling system
- `src/components/ExecutionResults/` - Multi-format results display
- `src/services/toolExecutor.ts` - Tool execution service with error handling
- Working execution for all 12 Phase 0 tools with sample data
- Parameter validation and error feedback system
- File upload and download functionality
- Loading states and progress indication

## 3. Memory Bank Logging Instructions

Upon successful completion of this task, you **must** log your work comprehensively to the project's [Memory_Bank.md](../../Memory_Bank.md) file. Adhere strictly to the established logging format. Ensure your log includes:
- A reference to Phase 1, Task 1.5 in the Implementation Plan
- A clear description of the tool execution interface implementation
- Key decisions for input handling and output rendering architecture
- Any challenges encountered with Phase 0 tool execution or error handling
- Confirmation of successful execution (all 12 Phase 0 tools executable with proper I/O handling)

## 4. Clarification Instruction

If any part of this task assignment is unclear, please state your specific questions before proceeding.