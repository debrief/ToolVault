# APM Task Assignment: Transform Tools Unit Testing

## 1. Agent Role & APM Context

You are activated as a Test Specialist Implementation Agent within the Agentic Project Management (APM) framework for the ToolVault project. Your specialized role involves creating comprehensive unit tests with a focus on achieving 100% code coverage and validating tool functionality against known reference data.

## 2. Onboarding / Context from Prior Work

**Prerequisites:** This task builds upon the completed work from:
- Task 0.1: Project structure established with Jest testing framework configured
- Task 0.2: Transform tools implemented (`translate.js`, `flip.js`) using IIFE pattern

**Connection to Prior Work:** You will now create comprehensive unit tests for the transformation tools implemented in Task 0.2, using the Jest framework and test utilities established in Task 0.1. Your tests must validate the spherical geometry calculations, coordinate transformations, and edge case handling implemented by the previous agent.

## 3. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to `Phase 0, Task 0.3 - Transform Tools Unit Testing` in the [Implementation_Plan.md](../../Implementation_Plan.md).

**Objective:** Create comprehensive unit tests for all transformation tools with 100% coverage.

**Detailed Action Steps:**

1. **Test Translate Features functionality:**
   - Create test file `tests/transform/translate.test.js`
   - Test translation with known coordinate sets and mathematically verified expected outputs
   - Verify distance and direction calculations against reference data using haversine formula validation
   - Test edge cases: zero distance, invalid directions (outside 0-360°), empty inputs, malformed GeoJSON
   - Validate complete GeoJSON structure preservation including properties, feature types, and metadata
   - Test coordinate boundary conditions (poles, antimeridian crossings)

2. **Test Flip operations:**
   - Create test file `tests/transform/flip.test.js`
   - Test horizontal flip with coordinates spanning different longitudes, including antimeridian scenarios
   - Test vertical flip with various latitude ranges, including polar regions
   - Verify axis parameter validation ("longitude", "latitude") and error handling for invalid values
   - Test with different geometry types: Point, LineString, Polygon, MultiPolygon
   - Validate property preservation and feature collection structure integrity

3. **Integration testing setup:**
   - Create test file `tests/integration/tool-loading.test.js`
   - Test tool loading through IIFE pattern using jsdom environment
   - Verify `window.ToolVault.tools` namespace availability and proper tool registration
   - Test tools with realistic sample data from `/data/` directory (created in Task 0.1)
   - Create test suites for browser compatibility using Jest's browser-like environment
   - Implement performance benchmarks for transformation operations

**Provide Necessary Context/Assets:**

- **Coverage Requirement:** All tests must contribute to achieving 100% code coverage target
- **Reference Data:** Use mathematically verified reference outputs for validation (create these as part of test fixtures)
- **Jest Configuration:** Leverage the Jest configuration established in Task 0.1 with jsdom environment
- **Sample Data:** Utilize sample GeoJSON files from Task 0.1 for realistic testing scenarios
- **Edge Cases:** Pay special attention to coordinate system edge cases (antimeridian, poles, invalid coordinates)

## 4. Expected Output & Deliverables

**Define Success:** Successful completion means comprehensive test coverage for all transformation tools with 100% code coverage, validated mathematical accuracy, and robust edge case handling.

**Specify Deliverables:**
- `tests/transform/translate.test.js` - Complete test suite for translation functionality
- `tests/transform/flip.test.js` - Complete test suite for flip operations
- `tests/integration/tool-loading.test.js` - Integration tests for IIFE tool loading
- Test coverage report showing 100% coverage for transformation tools
- Reference data fixtures for mathematical validation
- Performance benchmark results for transformation operations
- All tests passing with proper error handling validation

**Format:** Jest test files following established testing patterns with comprehensive assertions and coverage reporting.

## 5. Memory Bank Logging Instructions

Upon successful completion of this task, you **must** log your work comprehensively to the project's [Memory_Bank.md](../../Memory_Bank.md) file.

Adhere strictly to the established logging format. Ensure your log includes:
- A reference to the assigned task in the Implementation Plan (Phase 0, Task 0.3)
- A clear description of test strategies implemented for each transformation tool
- Code snippets showing critical test cases and assertions
- Mathematical validation approaches used for spherical geometry calculations
- Edge cases identified and tested
- Coverage report results confirming 100% target achievement
- Any challenges encountered with coordinate system testing or Jest configuration
- Confirmation of successful execution (all tests passing, coverage targets met)

## 6. Clarification Instruction

If any part of this task assignment is unclear, please state your specific questions before proceeding.