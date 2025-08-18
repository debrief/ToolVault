# APM Task Assignment: Implement Mock JavaScript Tool Bundle (Issue #1)

## 1. Agent Role & APM Context

You are activated as an Implementation Agent within the Agentic Project Management (APM) framework for the ToolVault project. Your role is to execute the assigned task diligently and document your work comprehensively. You will implement a complete JavaScript-based tool bundle that enables UI development and testing without backend dependencies.

## 2. Task Assignment

### Reference to GitHub Issue
This assignment corresponds to GitHub Issue #1: "Implement Mock JavaScript Tool Bundle"
- Issue URL: https://github.com/debrief/ToolVault/issues/1
- Priority: Medium (Enhancement)

### Objective
Create a fully functional JavaScript tool bundle at `/examples/javascript-bundle/` containing 11 GeoJSON processing tools that execute entirely in the browser, following the specifications in ADR-013.

### Detailed Action Steps

#### Phase 1: Setup and Infrastructure
1. **Create the bundle directory structure** at `/examples/javascript-bundle/`:
   - Create `tools/` subdirectories: `transform/`, `analysis/`, `statistics/`, `processing/`, `io/`
   - Create `data/` directory for sample files
   - Create `tests/` directory for Jest unit tests

2. **Initialize the JavaScript project**:
   - Create `package.json` with Jest testing framework
   - Configure Jest for browser-compatible JavaScript testing
   - Add npm scripts: `"test": "jest"`, `"test:watch": "jest --watch"`

3. **Create the index.json metadata file**:
   - Include `runtime: "javascript"` field for each tool
   - Define all 11 tools with complete metadata
   - Follow the schema established in ADR-013

4. **Generate sample data**:
   - Create `data/sample-track.geojson` - a GPS track LineString with timestamp properties
   - Ensure timestamps are suitable for speed/direction calculations

#### Phase 2: Tool Implementation

**CRITICAL: All tools MUST follow the IIFE pattern specified in ADR-013:**
```javascript
(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.toolName = function(input, params) {
    // Implementation
    return output;
  };
})();
```

**Transform Tools** (`tools/transform/`):
1. **translate.js** - Translate GeoJSON features
   - Inputs: GeoJSON FeatureCollection, direction (degrees), distance (meters)
   - Calculate new coordinates using bearing and distance formulas
   
2. **flip-horizontal.js** - Flip features horizontally
   - Input: GeoJSON FeatureCollection
   - Mirror coordinates across specified axis

3. **flip-vertical.js** - Flip features vertically
   - Input: GeoJSON FeatureCollection
   - Mirror coordinates across specified axis

**Analysis Tools** (`tools/analysis/`):
4. **speed-series.js** - Calculate speed time series
   - Input: GeoJSON LineString with timestamps
   - Output: JSON array with time/speed pairs
   - Use Haversine formula for distance calculations

5. **direction-series.js** - Calculate direction time series
   - Input: GeoJSON LineString with timestamps
   - Output: JSON array with time/bearing pairs
   - Calculate bearing between consecutive points

**Statistics Tools** (`tools/statistics/`):
6. **average-speed.js** - Calculate average speed
   - Input: GeoJSON LineString with timestamps
   - Output: Single numeric value
   
7. **speed-histogram.js** - Generate speed histogram
   - Input: GeoJSON LineString with timestamps
   - Parameters: interval_minutes (default: 1), bins (default: 20)
   - Output: JSON histogram structure

**Processing Tools** (`tools/processing/`):
8. **smooth-polyline.js** - Smooth LineString geometry
   - Input: GeoJSON LineString
   - Parameters: algorithm ("moving_average" or "gaussian"), window_size
   - Apply smoothing to coordinate sequence

**I/O Tools** (`tools/io/`):
9. **import-rep.js** - Parse REP format to GeoJSON
   - Input: REP format text
   - Output: GeoJSON FeatureCollection
   
10. **export-rep.js** - Convert GeoJSON to REP format
    - Input: GeoJSON FeatureCollection
    - Output: REP format string
    
11. **export-csv.js** - Convert GeoJSON to CSV
    - Input: GeoJSON FeatureCollection
    - Parameters: include_properties, coordinate_format
    - Output: CSV string

#### Phase 3: Testing

For each tool, create a corresponding test file in `tests/`:
- Use Jest's `describe` and `test` blocks
- Test with the sample GPS track data
- Verify output structure and calculations
- Ensure all tests pass before marking complete

Example test structure:
```javascript
describe('translateFeatures', () => {
  test('should translate features by specified distance and direction', () => {
    const input = // sample GeoJSON
    const params = { direction: 45, distance: 100 };
    const result = window.ToolVault.tools.translateFeatures(input, params);
    expect(result.type).toBe('FeatureCollection');
    // Additional assertions
  });
});
```

### Provide Necessary Context/Assets

**Reference ADR-013**: Review `/docs/ADRs/ADR-013-mock-javascript-toolset.md` for:
- Complete tool specifications table
- IIFE implementation pattern
- Input/output type definitions
- Bundle structure requirements

**Technical Constraints**:
- No external dependencies beyond standard Web APIs
- All tools must be synchronous (no async/await)
- Use browser-compatible JavaScript (ES2020+)
- Minimal error handling (assume valid input)

## 3. Expected Output & Deliverables

### Success Criteria
- All 11 tools implemented and functional in browser environment
- Jest tests passing for all tools
- index.json contains complete metadata with runtime field
- Sample GPS track data available for testing
- Tools accessible via `window.ToolVault.tools` namespace

### Deliverables
1. Complete `/examples/javascript-bundle/` directory with:
   - Implemented tool files in appropriate subdirectories
   - index.json with full metadata
   - package.json with Jest configuration
   - Sample data file(s)
   - Comprehensive test suite

2. All acceptance criteria from Issue #1 checked off:
   - [ ] All 11 tools implemented with IIFE pattern
   - [ ] Jest unit tests for each tool with passing status
   - [ ] index.json with complete metadata and runtime field
   - [ ] Sample GPS track data (single LineString with timestamps)
   - [ ] Tools executable in browser environment

## 4. Memory Bank Logging Instructions

Upon successful completion of this task, you **must** log your work comprehensively to the project's Memory Bank (if established) or create a detailed implementation summary. Your log should include:
- Reference to GitHub Issue #1
- List of all files created with their purposes
- Key implementation decisions (e.g., distance calculation methods, coordinate transformation approaches)
- Any challenges encountered and how they were resolved
- Confirmation of all tests passing
- Next steps for GitHub Pages deployment

## 5. Clarification Instruction

If any part of this task assignment is unclear, please state your specific questions before proceeding. Pay particular attention to:
- REP file format specification (if not documented)
- Specific algorithms for smoothing functions
- Coordinate system assumptions (WGS84, etc.)
- Expected precision for calculations