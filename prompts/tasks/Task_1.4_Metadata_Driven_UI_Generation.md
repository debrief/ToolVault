# APM Task Assignment: Metadata-Driven UI from index.json

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to `Phase 1, Task 1.4` in the [Implementation_Plan.md](../../Implementation_Plan.md).

**Objective:** Create dynamic UI components that generate interfaces directly from Phase 0 tool metadata, focusing on dynamic form generation and input/output rendering systems.

**Detailed Action Steps:**

1. **Implement dynamic form generation**
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

2. **Create input/output rendering system**
   - Develop `src/components/IOViewer/` component system:
     - `InputViewer.tsx` - Input data display and selection
     - `OutputViewer.tsx` - Output data rendering and visualization  
     - `IOTabs.tsx` - Tabbed input/output viewer (Raw, Preview, Download)
     - `JSONRenderer.tsx` - Syntax highlighted JSON display
     - `FileHandler.tsx` - File input/output generation and download
   - Support input/output formats from Phase 0 tools:
     - GeoJSON (Feature, FeatureCollection) with formatted display
     - JSON objects and arrays with collapsible tree view
     - String outputs (CSV, REP format) with text formatting
     - File inputs/outputs with upload/download trigger functionality
   - Implement syntax highlighting using `react-syntax-highlighter`
   - Handle large input/output rendering with pagination and virtualization
   - Add input/output copying functionality and format conversion options

**Provide Necessary Context/Assets:**
- Phase 0 tools return diverse input/output types: GeoJSON, JSON objects, strings, arrays
- All parameter definitions include validation rules, defaults, and help text in index.json  
- The UI must handle all 12 Phase 0 tool parameter schemas dynamically
- Reference ADR-001 for metadata-driven UI architecture principles
- Input/output viewer must prepare for LeafletJS integration (Task 2.1) for spatial data
- Check for UI requirements documentation in `docs/ui/readme.md`

## 2. Expected Output & Deliverables

**Define Success:** A complete metadata-driven UI system that dynamically generates forms and input/output viewers for all Phase 0 tools without hard-coded tool-specific components.

**Specify Deliverables:**
- `src/components/DynamicForm/` - Complete dynamic form generation system
- `src/components/IOViewer/` - Multi-format input/output rendering system  
- Working form generation for all 12 Phase 0 tool parameter schemas
- Input/output rendering supporting all Phase 0 tool formats
- Form validation and error handling system
- Responsive design supporting different screen sizes
- Syntax highlighting and data visualization components

## 3. Memory Bank Logging Instructions

Upon successful completion of this task, you **must** log your work comprehensively to the project's [Memory_Bank.md](../../Memory_Bank.md) file. Adhere strictly to the established logging format. Ensure your log includes:
- A reference to Phase 1, Task 1.4 in the Implementation Plan
- A clear description of the metadata-driven UI implementation
- Key architectural decisions for dynamic form and input/output rendering
- Any challenges encountered with complex parameter schemas or UI requirements
- Confirmation of successful execution (forms and I/O viewers generated correctly for all 12 Phase 0 tools)

## 4. Clarification Instruction

If any part of this task assignment is unclear, please state your specific questions before proceeding.