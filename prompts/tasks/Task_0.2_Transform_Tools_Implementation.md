# APM Task Assignment: Transform Tools Implementation

## 1. Agent Role & APM Context

You are continuing as an Implementation Agent within the Agentic Project Management (APM) framework for the ToolVault project. This task builds directly upon the foundational work completed in Task 0.1.

## 2. Onboarding / Context from Prior Work

**Prerequisites:** This task assumes successful completion of Task 0.1 - Project Structure and Jest Setup. The `/examples/javascript-bundle/` directory structure should be established with Jest testing framework configured and sample GeoJSON data files created.

**Connection to Prior Work:** You will now implement the first set of functional tools using the project structure and sample data established in Task 0.1. The tools you create will be tested using the Jest framework configured in the previous task.

## 3. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to `Phase 0, Task 0.2 - Transform Tools Implementation` in the [Implementation_Plan.md](../../Implementation_Plan.md).

**Objective:** Implement geometric transformation tools with IIFE pattern following ADR-013 specification.

**Detailed Action Steps:**

1. **Implement Translate Features tool:**
   - Create `tools/transform/translate.js` using IIFE (Immediately Invoked Function Expression) pattern
   - Function signature must be: `translateFeatures(input, params)` where params = {direction, distance}
   - Apply geometric translation to all features in GeoJSON FeatureCollection input
   - Handle coordinate system transformations and unit conversions appropriately
   - **Critical Guidance:** Use spherical geometry for accurate distance calculations (implement haversine formula or similar)
   - Ensure the tool registers itself in `window.ToolVault.tools` namespace as per IIFE pattern

2. **Implement Flip Horizontal tool:**
   - Create `tools/transform/flip.js` with horizontal flip functionality
   - Support flipping across longitude axis with proper coordinate handling
   - Preserve all feature properties and maintain complete GeoJSON structure
   - Handle edge cases like features crossing the antimeridian (180° longitude line)
   - Use robust coordinate validation to prevent invalid transformations

3. **Implement Flip Vertical tool:**
   - Extend flip.js with vertical flip capability across latitude axis
   - Support axis parameter with values: "longitude" or "latitude"
   - Ensure proper coordinate validation and bounds checking (-90 to +90 for latitude)
   - Maintain spatial relationships between features during transformation
   - Implement error handling for invalid axis parameter values

**Provide Necessary Context/Assets:**

- **ADR-013 Reference:** These tools must follow the IIFE pattern specified in ADR-013 for JavaScript tool architecture
- **IIFE Pattern Implementation:** Each tool should wrap its functionality in an IIFE that registers the tool function in the global `window.ToolVault.tools` object
- **Sample Data:** Use the sample GeoJSON files created in Task 0.1 (`sample-track.geojson`, `sample-features.geojson`) for initial testing
- **Coordinate Systems:** Assume WGS84 geographic coordinates (latitude/longitude) for all inputs
- **Distance Calculations:** For translation tool, implement proper spherical distance calculations accounting for Earth's curvature

## 4. Expected Output & Deliverables

**Define Success:** Successful completion means having three working transformation tools that can process GeoJSON FeatureCollections and produce valid transformed outputs while preserving data integrity.

**Specify Deliverables:**
- `tools/transform/translate.js` - Translation tool with spherical geometry calculations
- `tools/transform/flip.js` - Flip tool supporting both horizontal and vertical operations
- Each tool properly registered in `window.ToolVault.tools` namespace
- Tools validated against sample data from Task 0.1
- All coordinate transformations producing valid GeoJSON outputs
- Proper error handling for invalid inputs and parameters

**Format:** JavaScript files following IIFE pattern with proper tool registration and parameter validation.

## 5. Memory Bank Logging Instructions

Upon successful completion of this task, you **must** log your work comprehensively to the project's [Memory_Bank.md](../../Memory_Bank.md) file.

Adhere strictly to the established logging format. Ensure your log includes:
- A reference to the assigned task in the Implementation Plan (Phase 0, Task 0.2)
- A clear description of the transformation algorithms implemented
- Code snippets showing the IIFE pattern implementation and tool registration
- Key decisions made regarding spherical geometry calculations and coordinate handling
- Any challenges encountered with coordinate transformations or edge cases
- Validation results against sample data from Task 0.1
- Confirmation of successful execution (tools loading and producing valid outputs)

## 6. Clarification Instruction

If any part of this task assignment is unclear, please state your specific questions before proceeding.