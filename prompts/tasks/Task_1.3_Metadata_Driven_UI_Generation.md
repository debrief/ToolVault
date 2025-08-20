# APM Task Assignment: Metadata-Driven UI from index.json

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to `Phase 1, Task 1.3` in the [Implementation_Plan.md](../../Implementation_Plan.md).

**Objective:** Create dynamic UI components that generate interfaces directly from Phase 0 tool metadata, following the metadata-driven UI architecture (ADR-001).

**Detailed Action Steps:**

1. **Parse tool metadata from Phase 0 index.json**
   - Load and validate `examples/javascript-bundle/index.json` structure with runtime field
   - Create comprehensive TypeScript interfaces in `src/types/` for:
     - Tool definitions with parameter schemas
     - Parameter types: number, string, boolean, enum with defaults and validation
     - Input/output type specifications (Feature, FeatureCollection, Point, LineString, Polygon, etc.)
     - Example definitions and constraint handling
   - Implement metadata parsing service in `src/services/metadataParser.ts`
   - Handle metadata parsing errors and validation with detailed error messages
   - Support schema validation against expected tool definition structure

2. **Implement dynamic form generation**
   - Take note of UI requirements in `docs/ui/readme.md`
   - Create `src/components/DynamicForm/` component suite:
     - `ParameterForm.tsx` - Main form component
     - `ParameterField.tsx` - Individual parameter input fields
     - `ParameterValidation.ts` - Validation logic service
   - Generate forms dynamically based on Phase 0 parameter schemas supporting:
     - Number fields with min/max validation and step controls
     - String fields with pattern validation and text areas
     - Boolean fields with checkbox/toggle components
     - Enum fields with dropdown/radio button selection
     - Default value population from Phase 0 tool metadata
   - Implement form state management using React hooks with real-time validation
   - Add parameter help text display and validation error feedback
   - Support parameter dependency handling and conditional field display

3. **Create input/output rendering system**
   - Develop `src/components/DataViewer/` component system:
     - `ViewerTabs.tsx` - Tabbed content viewer (Raw, Preview, Download)
     - `JSONRenderer.tsx` - Syntax highlighted JSON display
     - `GeoJSONRenderer.tsx` - Spatial data preview component
     - `FileDownloader.tsx` - File output generation and download
   - Support input/output formats from Phase 0 tools:
     - GeoJSON (Feature, FeatureCollection) with formatted display
     - JSON objects and arrays with collapsible tree view
     - String outputs (CSV, REP format) with text formatting
     - File outputs with download trigger functionality
   - Implement syntax highlighting using `react-syntax-highlighter`
   - Handle large input/output rendering with pagination and virtualization

**Provide Necessary Context/Assets:**
- Phase 0 tools return diverse output types: GeoJSON, JSON objects, strings, arrays
- All parameter definitions include validation rules, defaults, and help text in index.json  
- The UI must handle all 12 Phase 0 tool parameter schemas dynamically
- Reference ADR-001 for metadata-driven UI architecture principles
- Output viewer must prepare for LeafletJS integration (Task 2.1) for spatial data

## 2. Expected Output & Deliverables

**Define Success:** A complete metadata-driven UI system that dynamically generates forms and output viewers for all Phase 0 tools without hard-coded tool-specific components.

**Specify Deliverables:**
- `src/services/metadataParser.ts` - Metadata parsing and validation service
- `src/components/DynamicForm/` - Complete dynamic form generation system
- `src/components/DataViewer/` - Multi-format input/output rendering system  
- `src/types/metadata.ts` - Comprehensive TypeScript interfaces for tool metadata
- Working form generation for all 12 Phase 0 tool parameter schemas
- Input/output rendering supporting all Phase 0 tool formats
- Form validation and error handling system
- Responsive design supporting different screen sizes

## 3. Memory Bank Logging Instructions

Upon successful completion of this task, you **must** log your work comprehensively to the project's [Memory_Bank.md](../../Memory_Bank.md) file. Adhere strictly to the established logging format. Ensure your log includes:
- A reference to Phase 1, Task 1.3 in the Implementation Plan
- A clear description of the metadata-driven UI implementation
- Key architectural decisions for dynamic form and output rendering
- Any challenges encountered with complex parameter schemas
- Confirmation of successful execution (forms generated correctly for all 12 Phase 0 tools)

## 4. Clarification Instruction

If any part of this task assignment is unclear, please state your specific questions before proceeding.