# APM Task Assignment: LeafletJS Spatial Visualization Integration

## 1. Agent Role & APM Context

You are activated as an Implementation Agent within the Agentic Project Management (APM) framework for the ToolVault project. Your role is to execute assigned tasks diligently while maintaining comprehensive documentation of all work performed. You will work with the Manager Agent (via the User) and must log all activities to the Memory Bank for project continuity.

## 2. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to `Phase 2, Task 2.1` in the [Implementation_Plan.md](../../Implementation_Plan.md).

**Objective:** Integrate interactive maps for visualizing GeoJSON outputs from Phase 0 spatial tools, specifically implementing LeafletJS to display results from Transform and Processing tools created in Phase 0.

**Detailed Action Steps:**

1. **Set up LeafletJS integration:**
   - Install Leaflet and React-Leaflet packages using yarn
   - Configure Leaflet CSS and create map container components that integrate with the existing React/TypeScript frontend
   - Set up base map tiles (OpenStreetMap) for offline compatibility - ensure the application can function without internet access
   - Create reusable map component with zoom and pan controls following the existing component architecture

2. **Implement GeoJSON rendering for Phase 0 outputs:**
   - Add GeoJSON layer support specifically for outputs from Transform tools (translate-features, flip-horizontal, flip-vertical) and Processing tools (smooth-polyline)
   - Style different geometry types (Point, LineString, Polygon) with distinct colors and appropriate visual hierarchy
   - Implement popup displays for feature properties and metadata, showing tool execution details and original vs transformed coordinates
   - Add fit-to-bounds functionality for automatic zoom to data extent when displaying tool results

3. **Enhanced spatial output viewer:**
   - Integrate map as new tab in the existing multi-format output viewer (alongside Raw, Preview, Download tabs)
   - Support switching between map view and raw JSON view seamlessly
   - Add map export functionality (PNG screenshot) for saving visual results
   - Test integration thoroughly with outputs from Phase 0 spatial transformation tools using the sample data from `/examples/javascript-bundle/data/`

**Provide Necessary Context/Assets:**

- The existing frontend is located in `/toolvault-frontend/` with React/TypeScript setup
- Phase 0 tools are integrated via the bundle loading service in `src/services/bundleLoader.ts`
- The current output viewer system is in `src/components/` - you must extend this existing architecture
- **Reference ADR-005:** Review this ADR for the architectural decision to use LeafletJS for spatial visualization
- Phase 0 sample data includes `sample-track.geojson` and `sample-features.geojson` for testing
- The project follows strict TypeScript with no `any` types allowed

**Constraints:**
- Maintain offline compatibility - all map functionality must work without internet access
- Follow existing component architecture and styling patterns
- Ensure LeafletJS integration doesn't break existing Phase 0 tool execution
- All new components must have proper TypeScript interfaces

## 3. Expected Output & Deliverables

**Define Success:** Successful completion requires:
- LeafletJS fully integrated into the React application
- GeoJSON visualization working for all Phase 0 spatial tool outputs
- Map component integrated into existing output viewer tabs
- Offline map functionality verified
- All Phase 0 spatial tools tested with map visualization

**Specify Deliverables:**
- Modified package.json with LeafletJS dependencies
- New map components in `/toolvault-frontend/src/components/`
- Enhanced output viewer with map tab integration
- Updated TypeScript interfaces for spatial data handling
- Tested integration with Phase 0 Transform and Processing tools

## 4. Memory Bank Logging Instructions

Upon successful completion of this task, you **must** log your work comprehensively to the project's [Memory_Bank.md](../../Memory_Bank.md) file.

Adhere strictly to the established logging format. Ensure your log includes:
- A reference to Phase 2, Task 2.1 in the Implementation Plan
- A clear description of LeafletJS integration actions taken
- Any code snippets for key map components created
- Any key decisions made regarding offline map tiles or styling
- Confirmation of successful execution with Phase 0 tool testing results
- Any challenges encountered with React-Leaflet integration

## 5. Clarification Instruction

If any part of this task assignment is unclear, please state your specific questions before proceeding.