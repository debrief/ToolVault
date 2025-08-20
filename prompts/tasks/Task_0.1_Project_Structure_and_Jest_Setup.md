# APM Task Assignment: Project Structure and Jest Setup

## 1. Agent Role & APM Context

You are activated as an Implementation Agent within the Agentic Project Management (APM) framework for the ToolVault project. Your role as an Implementation Agent is to execute assigned tasks diligently and log your work meticulously to ensure project continuity. You will interact with the Manager Agent (via the User) and contribute to the centralized Memory Bank system for knowledge preservation across the project lifecycle.

## 2. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to `Phase 0, Task 0.1 - Project Structure and Jest Setup` in the [Implementation_Plan.md](../../Implementation_Plan.md).

**Objective:** Establish the JavaScript toolbox repository with comprehensive testing framework.

**Detailed Action Steps:**

1. **Create project directory structure:**
   - Set up `/examples/javascript-bundle/` directory in the project root
   - Create the following subdirectories within the bundle:
     - `/tools/` - for tool implementations
     - `/data/` - for sample data files
     - `/tests/` - for test files
     - `/schemas/` - for schema definitions
   - Initialize `package.json` with Jest testing configuration
   - Configure npm scripts: `test`, `test:watch`, `test:coverage`

2. **Install and configure Jest testing framework:**
   - Install Jest with ES6 module support using npm
   - Configure Jest for browser-like environment using jsdom
   - Set up code coverage reporting with 100% target coverage threshold
   - Create shared test utilities in `/tests/helpers.js` for common test functions

3. **Create sample data and test fixtures:**
   - Generate `sample-track.geojson` with GPS track containing timestamps in the `/data/` directory
   - Create `sample-features.geojson` with mixed FeatureCollection containing different geometry types
   - Add test data for different geometric types: Point, LineString, and Polygon features
   - Create reference outputs for validation testing to be used by subsequent test tasks

**Provide Necessary Context/Assets:**

The project follows a bundle-based architecture where each tool bundle is self-contained with its dependencies. The JavaScript bundle will serve as the foundation for all subsequent tool implementations in Phase 0. Ensure all configurations support offline operation without external dependencies.

## 3. Expected Output & Deliverables

**Define Success:** Successful completion means having a fully configured JavaScript toolbox directory with Jest testing framework ready for tool development and comprehensive test coverage reporting.

**Specify Deliverables:**
- `/examples/javascript-bundle/` directory with proper subdirectory structure
- Configured `package.json` with Jest dependencies and npm scripts
- Jest configuration supporting ES6 modules and jsdom environment
- Sample GeoJSON data files ready for tool testing
- Basic test helper utilities for shared test functionality
- All configurations validated and ready for tool implementation

**Format:** Standard npm project structure with Jest configuration following Node.js best practices.

## 4. Memory Bank Logging Instructions

Upon successful completion of this task, you **must** log your work comprehensively to the project's [Memory_Bank.md](../../Memory_Bank.md) file.

Adhere strictly to the established logging format. Ensure your log includes:
- A reference to the assigned task in the Implementation Plan (Phase 0, Task 0.1)
- A clear description of the actions taken
- Key configuration decisions made for Jest setup
- Directory structure created and rationale
- Sample data files created and their specifications  
- Any challenges encountered during setup
- Confirmation of successful execution (tests running, coverage reporting functional)

## 5. Clarification Instruction

If any part of this task assignment is unclear, please state your specific questions before proceeding.