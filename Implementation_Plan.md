# Implementation Plan

Project Goal: Develop a metadata-driven Single Page Application for ToolVault Phase 1, providing a static UI for browsing and viewing analysis tools from an `index.json` file.

## Phase 1: Project Setup & Infrastructure - Agent Group Alpha (Agent_Setup_Specialist, Agent_Testing_Config)

### Task 1.1 - Agent_Setup_Specialist: Initialize React TypeScript Project
Objective: Set up the foundational React project with TypeScript, Vite, and pnpm package manager.

1. Initialize Vite React TypeScript project.
   - Run `pnpm create vite client --template react-ts`
   - Navigate to the client directory
   - Install dependencies with `pnpm install`
   - Verify the development server runs correctly
2. Configure TypeScript for strict mode.
   - Update `tsconfig.json` with strict type checking options
   - Enable `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
   - Configure module resolution for absolute imports
   - Add path aliases for common directories (@components, @utils, @types)
3. Set up project directory structure.
   - Create `src/components/` for React components
   - Create `src/types/` for TypeScript interfaces and types
   - Create `src/utils/` for utility functions
   - Create `src/hooks/` for custom React hooks
   - Create `src/services/` for API/data fetching logic
   - Create `public/data/` for static index.json file
4. Configure development environment.
   - Set up `.env` file for environment variables
   - Configure Vite for proper asset handling
   - Set up hot module replacement (HMR)
   - Configure build optimization settings

### Task 1.2 - Agent_Setup_Specialist: Install and Configure Material-UI
Objective: Integrate Material-UI (MUI) component library with custom theming.

1. Install Material-UI dependencies.
   - Run `pnpm add @mui/material @emotion/react @emotion/styled`
   - Install MUI icons: `pnpm add @mui/icons-material`
   - Install Roboto font and configure in index.html
2. Create custom MUI theme.
   - Create `src/theme/theme.ts` with custom color palette
   - Define primary and secondary colors aligned with ToolVault branding
   - Configure typography settings
   - Set up responsive breakpoints
3. Set up theme provider.
   - Wrap application with `ThemeProvider` in main.tsx
   - Create theme context for dynamic theme switching (future feature)
   - Implement CssBaseline for consistent styling
4. Create base layout components.
   - Build AppBar component with ToolVault branding
   - Create responsive navigation drawer
   - Implement footer component
   - Set up main content container with proper spacing

### Task 1.3 - Agent_Testing_Config: Configure Testing Infrastructure
Objective: Set up comprehensive testing framework with Jest, React Testing Library, and Playwright.

1. Install and configure unit testing dependencies.
   - Install Jest and React Testing Library: `pnpm add -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event`
   - Install TypeScript Jest support: `pnpm add -D ts-jest @types/jest`
   - Create `jest.config.js` with TypeScript and React support
   - Configure test environment with jsdom
2. Set up component testing utilities.
   - Create `src/test-utils/` directory
   - Implement custom render function with providers (Theme, Router)
   - Create mock data generators for index.json
   - Set up MSW (Mock Service Worker) for API mocking
3. Configure E2E testing with Playwright.
   - Install Playwright: `pnpm add -D @playwright/test`
   - Create `playwright.config.ts` with browser configurations
   - Set up test fixtures and page objects pattern
   - Configure visual regression testing capabilities
4. Create testing scripts and CI configuration.
   - Add test scripts to package.json (test, test:watch, test:coverage, test:e2e)
   - Create GitHub Actions workflow for CI/CD
   - Set up pre-commit hooks with Husky for test execution
   - Configure coverage thresholds (minimum 80% coverage)

### Task 1.4 - Agent_Setup_Specialist: Create TypeScript Interfaces from Schema
Objective: Define TypeScript interfaces based on the provided index.schema.json.

1. Analyze the JSON schema structure.
   - Review `samples/index.schema.json` thoroughly
   - Identify all data types and relationships
   - Note required vs optional fields
2. Create core type definitions.
   - Create `src/types/index.ts` as main type export file
   - Define `ToolVaultIndex` interface for root object
   - Define `Tool` interface with all properties
   - Define `ToolInput` and `ToolOutput` interfaces
   - Create enum types for categories and input/output types
3. Implement type guards and validators.
   - Create runtime validation functions using the schema
   - Implement type predicates for type narrowing
   - Add JSON schema validation utility
4. Generate mock data factories.
   - Create factory functions for generating test data
   - Ensure factories respect schema constraints
   - Export utilities for testing purposes

## Phase 2: Core UI Implementation - Agent Group Beta (Agent_Frontend_Dev, Agent_UI_Specialist)

### Task 2.1 - Agent_Frontend_Dev: Implement Data Service Layer
Objective: Create service layer for fetching and managing index.json data.

1. Create data fetching service.
   - Implement `src/services/toolVaultService.ts`
   - Create async function to fetch index.json from `/data/index.json`
   - Add error handling for network failures
   - Implement retry logic with exponential backoff
2. Add data caching mechanism.
   - Implement in-memory cache for fetched data
   - Add cache invalidation strategy
   - Create hooks for cache management
3. Create React hooks for data access.
   - Build `useToolVaultData()` custom hook
   - Implement loading and error states
   - Add data transformation logic
   - Create `useToolById(id)` for specific tool access
4. Set up React Query integration.
   - Install and configure React Query: `pnpm add @tanstack/react-query`
   - Create query client with optimal settings
   - Implement query invalidation patterns
   - Add optimistic updates support

### Task 2.2 - Agent_UI_Specialist: Build Tool List View Component
Objective: Create the main tool browsing interface with search and filter capabilities.

1. Create ToolList component structure.
   - Build `src/components/ToolList/ToolList.tsx`
   - Implement responsive grid layout using MUI Grid
   - Create ToolCard component for individual tools
   - Add pagination or virtual scrolling for performance
2. Implement search functionality.
   - Create SearchBar component with MUI TextField
   - Implement real-time search with debouncing
   - Add search by name, description, and tags
   - Highlight search matches in results
3. Build filtering system.
   - Create FilterPanel component with MUI Accordion
   - Add category filter with checkboxes
   - Implement tag-based filtering with chips
   - Create clear filters functionality
4. Add sorting capabilities.
   - Implement sort by name (A-Z, Z-A)
   - Add sort by category
   - Create sort dropdown using MUI Select
   - Persist sort preferences in local storage

### Task 2.3 - Agent_UI_Specialist: Create Tool Detail View Component
Objective: Build detailed view for individual tools showing inputs, outputs, and metadata.

1. Create ToolDetail component.
   - Build `src/components/ToolDetail/ToolDetail.tsx`
   - Design layout with MUI Paper and Typography
   - Display tool name, description, and category
   - Show tags as MUI Chips
2. Implement inputs display section.
   - Create InputsList component
   - Display each input with name, label, and type
   - Show required/optional status with icons
   - Add tooltips for additional information
3. Implement outputs display section.
   - Create OutputsList component
   - Display each output with name, label, and type
   - Use consistent styling with inputs section
   - Add placeholder for future output preview
4. Add action buttons and navigation.
   - Create non-functional "Run" button with MUI Button
   - Add "Back to List" navigation
   - Implement breadcrumb navigation
   - Add share/bookmark placeholders for future

### Task 2.4 - Agent_Frontend_Dev: Implement Routing and Navigation
Objective: Set up React Router for navigation between list and detail views.

1. Install and configure React Router.
   - Install `pnpm add react-router-dom`
   - Create router configuration in main.tsx
   - Define routes for list (/) and detail (/tool/:id)
   - Implement 404 not found page
2. Create navigation components.
   - Build NavigationBar with route links
   - Implement breadcrumb component
   - Add active route highlighting
   - Create route guards for invalid tool IDs
3. Implement URL state management.
   - Sync search/filter state with URL params
   - Create shareable URLs for filtered views
   - Implement browser back/forward support
   - Add deep linking capability
4. Add route transitions.
   - Implement smooth page transitions
   - Add loading indicators during navigation
   - Create skeleton screens for better UX
   - Implement scroll restoration

## Phase 3: Testing & Polish - Agent Group Gamma (Agent_QA_Specialist, Agent_Performance_Optimizer)

### Task 3.1 - Agent_QA_Specialist: Write Unit Tests for Components
Objective: Achieve comprehensive unit test coverage for all React components.

1. Test data service layer.
   - Write tests for toolVaultService functions
   - Test error handling scenarios
   - Verify caching behavior
   - Test data transformation logic
2. Test UI components.
   - Write tests for ToolList component
     * Test rendering with mock data
     * Verify search functionality
     * Test filter operations
     * Validate sorting behavior
   - Write tests for ToolDetail component
     * Test data display accuracy
     * Verify navigation functionality
     * Test edge cases (missing fields)
3. Test custom hooks.
   - Test useToolVaultData hook
   - Verify loading and error states
   - Test data updates and refetching
   - Validate hook cleanup
4. Test utility functions.
   - Test type guards and validators
   - Verify search/filter algorithms
   - Test data formatting functions
   - Validate error handling utilities

### Task 3.2 - Agent_QA_Specialist: Implement E2E Tests
Objective: Create end-to-end tests covering critical user workflows.

1. Set up E2E test infrastructure.
   - Configure Playwright test environment
   - Create page object models
   - Set up test data fixtures
   - Configure multiple browser testing
2. Test core user journeys.
   - Test initial page load and data fetching
   - Test navigation from list to detail view
   - Test search functionality end-to-end
   - Test filter and sort combinations
3. Test error scenarios.
   - Test behavior with missing index.json
   - Test invalid tool ID navigation
   - Test network error handling
   - Verify graceful degradation
4. Implement visual regression tests.
   - Capture baseline screenshots
   - Test responsive layouts
   - Verify theme consistency
   - Test accessibility features

### Task 3.3 - Agent_Performance_Optimizer: Optimize Application Performance
Objective: Ensure optimal loading times and runtime performance.

1. Implement code splitting.
   - Configure dynamic imports for routes
   - Lazy load heavy components
   - Optimize bundle sizes
   - Implement progressive loading
2. Optimize rendering performance.
   - Implement React.memo for expensive components
   - Add useMemo for complex calculations
   - Optimize re-render patterns
   - Implement virtual scrolling for large lists
3. Optimize asset loading.
   - Compress and optimize images
   - Implement proper caching headers
   - Use CDN for static assets
   - Optimize font loading strategies
4. Add performance monitoring.
   - Implement Web Vitals tracking
   - Add custom performance marks
   - Create performance budget
   - Set up monitoring dashboard

### Task 3.4 - Agent_Frontend_Dev: Add Error Handling and Loading States
Objective: Implement comprehensive error handling and user feedback.

1. Create error boundary components.
   - Implement global error boundary
   - Create route-specific error boundaries
   - Design user-friendly error pages
   - Add error reporting mechanism
2. Implement loading states.
   - Create skeleton screens for components
   - Add progress indicators for data fetching
   - Implement suspense boundaries
   - Create smooth loading transitions
3. Add user notifications.
   - Implement toast notifications with MUI Snackbar
   - Create inline error messages
   - Add success confirmations
   - Implement offline detection
4. Create fallback UI.
   - Design offline mode interface
   - Create data placeholder components
   - Implement retry mechanisms
   - Add help and documentation links

### Task 3.5 - Agent_QA_Specialist: Accessibility and Final Polish
Objective: Ensure WCAG 2.1 AA compliance and polish user experience.

1. Implement accessibility features.
   - Add proper ARIA labels and roles
   - Ensure keyboard navigation support
   - Implement focus management
   - Add screen reader announcements
2. Test accessibility compliance.
   - Run automated accessibility audits
   - Perform manual keyboard testing
   - Test with screen readers
   - Verify color contrast ratios
3. Polish UI interactions.
   - Add micro-animations and transitions
   - Implement hover states and feedback
   - Optimize touch targets for mobile
   - Add keyboard shortcuts
4. Create documentation.
   - Write component documentation
   - Create user guide for the UI
   - Document accessibility features
   - Add inline help tooltips

## Phase 4: Full UI with Mock Tool Execution - Agent Group Delta (Agent_Frontend_Dev, Agent_UI_Specialist)

**Note:** This phase corresponds to **Phase 3** in the Software Requirements Document - "Full Browsing UI with Output Rendering"

### Task 4.1 - Agent_Frontend_Dev: Implement Mock Backend Service
Objective: Create REST mock server providing canned responses for tool execution.

1. Set up mock service infrastructure.
   - Install and configure MSW (Mock Service Worker)
   - Create `src/mocks/` directory structure
   - Define mock API endpoints for tool execution
   - Set up request/response handlers
2. Create mock tool execution responses.
   - Generate sample execution results for each tool type
   - Include realistic output data (GeoJSON, tables, charts)
   - Mock execution timing and progress updates
   - Create error scenarios for testing
3. Implement execution state management.
   - Create execution status tracking (idle, running, complete, error)
   - Add execution progress indicators
   - Implement cancellation capability
   - Store execution results temporarily
4. Wire mock service to frontend.
   - Update toolVaultService to use mock endpoints
   - Add execution API methods
   - Handle authentication and error responses
   - Configure development vs production modes

### Task 4.2 - Agent_UI_Specialist: Enhanced Search and Filtering
Objective: Implement advanced search and filter capabilities with badges and metadata.

1. Implement advanced search features.
   - Add full-text search across all tool metadata
   - Implement search result highlighting
   - Add search suggestions and autocomplete
   - Create search history and saved searches
2. Build comprehensive filtering system.
   - Add category-based filtering with counts
   - Implement tag-based filtering with multi-select
   - Create date-based filters ("New" and "Updated" badges)
   - Add input/output type filtering
3. Create metadata-driven badges.
   - Implement "New" badges based on creation timestamps
   - Add "Updated" badges for recently modified tools
   - Create status badges (beta, stable, deprecated)
   - Add complexity indicators (beginner, advanced)
4. Enhance UI with filter visualizations.
   - Create filter summary chips
   - Add clear all filters functionality
   - Implement filter presets (e.g., "GIS Tools", "Text Analysis")
   - Show active filter count in navigation

### Task 4.3 - Agent_UI_Specialist: Advanced Output Rendering
Objective: Implement production-grade output viewers for different data types.

1. Implement LeafletJS map rendering.
   - Install and configure React-Leaflet
   - Create MapViewer component for GeoJSON outputs
   - Add map controls (zoom, pan, layer switching)
   - Implement feature popup and interaction
2. Create interactive table viewer.
   - Build TableViewer component with sorting/filtering
   - Add pagination for large datasets
   - Implement column resizing and reordering
   - Create export functionality (CSV, JSON)
3. Build chart visualization components.
   - Install and configure Chart.js or similar
   - Create ChartViewer for numeric outputs
   - Support multiple chart types (bar, line, scatter, pie)
   - Add interactive features (zoom, hover, selection)
4. Implement universal output renderer.
   - Create OutputRenderer component with type detection
   - Support image previews and galleries
   - Add JSON/XML syntax highlighting
   - Create text viewers with formatting options

### Task 4.4 - Agent_Frontend_Dev: Tool Execution Integration
Objective: Wire tool execution flow from input to output display.

1. Enhance ExecutionPanel with real functionality.
   - Connect input forms to execution service
   - Implement real-time execution progress
   - Add execution cancellation capability
   - Show detailed error messages with suggestions
2. Create execution workflow management.
   - Implement execution queuing for multiple tools
   - Add execution retry functionality
   - Create execution templates for common use cases
   - Implement batch execution capabilities
3. Integrate output rendering with execution.
   - Display real-time execution progress
   - Stream output data as it becomes available
   - Handle partial results and incremental updates
   - Implement output caching and persistence
4. Add execution analytics and feedback.
   - Track execution metrics (duration, success rate)
   - Implement user feedback collection
   - Add execution sharing and collaboration features
   - Create execution comparison tools

### Task 4.5 - Agent_UI_Specialist: Responsive Design and Mobile Optimization
Objective: Ensure optimal experience across all device types and screen sizes.

1. Implement comprehensive responsive design.
   - Optimize layouts for desktop (>1200px)
   - Adapt interfaces for tablet (768-1199px)
   - Create mobile-first design (<768px)
   - Test on dual-monitor workflows
2. Create mobile-specific interactions.
   - Implement touch-friendly controls
   - Add swipe gestures for navigation
   - Optimize tap targets and spacing
   - Create mobile-specific UI patterns
3. Optimize performance for mobile devices.
   - Implement progressive image loading
   - Add connection-aware features
   - Optimize bundle size for mobile
   - Implement offline capability basics
4. Create adaptive UI components.
   - Build responsive navigation patterns
   - Create collapsible/expandable sections
   - Implement adaptive data visualization
   - Add device-specific feature detection

---

## Phase 5: Working JS Implementation - Agent Group Epsilon (Agent_Frontend_Dev, Agent_Tool_Integrator)

**Note:** This phase corresponds to **Phase 4** in the Software Requirements Document — "Working JS Implementation".

### Task 5.1 - Agent_Tool_Integrator: Integrate Real Tool Modules (TypeScript/JavaScript)
Objective: Enable execution of real tools written in TypeScript/JavaScript, compiled as ES modules, within the SPA (no Python infrastructure).

1. Define tool module structure and requirements.
   - Specify convention for tool modules (e.g., each exports a `run()` function with input/output signature).
   - Document expected input/output types and error handling.
   - Guidance: Align with sample in `index.json` and SRD.
2. Organize tool source and build outputs in the project.
   - Place tool `.ts` source and compiled `.js` in `client/src/tools/` or designated directory.
   - Ensure build process outputs ES modules compatible with dynamic import.
   - Guidance: Use Vite/TS build config to ensure output format.
3. Update `index.json` with real tool entries.
   - Add at least two tools (e.g., `word-count`, `change-color-to-red`) with correct module paths.
   - Specify params and outputs as per SRD example.
   - Guidance: Validate index against schema.

### Task 5.2 - Agent_Frontend_Dev: Dynamic Tool Loading and Execution Pipeline
Objective: Implement dynamic loading and execution of tool modules via `import()`, with input validation and output rendering.

1. Implement dynamic import of tool modules.
   - Use `import()` to load module specified in `index.json` at runtime.
   - Handle loading errors and fallback gracefully.
   - Guidance: Ensure compatibility with Vite/SPA build.
2. Validate tool inputs and outputs.
   - Validate input params against type definitions in `index.json` before execution.
   - Validate outputs after execution; display error if contract is violated.
   - Guidance: Use TypeScript types and runtime checks.
3. Invoke `run()` in a Web Worker.
   - Offload execution to a Web Worker to avoid blocking the UI.
   - Pass validated inputs to worker, receive outputs/messages.
   - Handle worker errors and timeouts.
   - Guidance: Use transferable objects for performance if possible.
4. Render outputs in the UI.
   - Display results using existing output rendering pipeline (tables, maps, etc.).
   - Show execution progress and errors.
   - Guidance: Reuse/extend UI components from previous phases.

### Task 5.3 - Agent_Frontend_Dev: Error Handling and Developer Experience
Objective: Provide robust error handling, developer feedback, and maintainability for tool integration and execution.

1. Implement user-friendly error reporting for tool execution failures.
   - Display clear error messages for module load errors, validation failures, and runtime exceptions.
   - Provide developer diagnostics in development mode.
   - Guidance: Ensure errors are actionable for both users and developers.
2. Document tool integration process.
   - Create developer guide for adding new tools (structure, build, registration in `index.json`).
   - Include troubleshooting tips for common issues (e.g., module not found, type mismatch).
   - Guidance: Update project docs in `client/docs/`.
3. Add basic test cases for tool execution pipeline.
   - Write unit tests for dynamic import, validation, and worker communication.
   - Ensure at least one test per tool type (e.g., GeoJSON, string processing).
   - Guidance: Use Jest/RTL for UI, and worker test utilities.

### Task 5.4 - Agent_Tool_Integrator & Agent_Frontend_Dev: Minimal Catalog and Example Tools
Objective: Deliver a minimal working catalog with at least two real tools, fully integrated and executable via the SPA.

1. Implement and test sample tools (`word-count`, `change-color-to-red`).
   - Write TypeScript source, compile to ES modules, and register in `index.json`.
   - Ensure tools conform to input/output contract and are documented.
   - Guidance: Follow SRD sample for tool structure.
2. Verify end-to-end execution in the browser.
   - Run tools via SPA UI, validate correct outputs and error handling.
   - Guidance: Test both tools with edge-case inputs.
3. Deliverables:
   - Minimal tool catalog in `index.json`.
   - At least two working tools in `client/src/tools/`.
   - Worker-based execution pipeline.
   - Basic error handling and tests.

### Task 5.5 - Agent_Tool_Integrator: Implement Additional JS Tools for UI Demonstration
Objective: Implement and integrate a set of additional JavaScript tools to drive and demonstrate the user interface, as described in the software requirements.

1. Implement the following tools as TypeScript modules, compile to ES modules, and register in `index.json`:
   - `word-frequency`: Accepts a paragraph of text, outputs a table of word frequencies (word and count).
   - `flip-line`: Accepts a GeoJSON LineString, swaps the order of the latitude coordinates, leaving longitude unchanged.
   - `line-centre`: Accepts a GeoJSON LineString, outputs a GeoJSON Point at the centre of the line (arithmetic mean, not spatial).
   - `calc-speeds`: Accepts a GeoJSON LineString with a `properties.times` array of unix DTG (one per point), computes speed for each segment (distance/time), outputs a time-series array of speeds.
2. For each tool:
   - Ensure input/output types are minimal but descriptive, and update `index.json` accordingly.
   - Follow the same module structure and conventions as previous tool tasks (Task 5.1, 5.4).
   - Validate inputs and outputs per the schema and UI contract.
   - Add documentation for each tool, including usage and input/output contract.
   - Provide at least one test case per tool.
3. Integrate these tools into the SPA so they are discoverable and executable via the UI.
   - Ensure outputs render correctly using the existing output rendering pipeline.
   - Validate correct error handling and UI feedback for edge cases and invalid input.

Guidance: Refer to the Software Requirements Document (SRD) and the sample tool entries in `index.json` for structure and contract. Tools should help drive development and demonstration of the interface, so prioritize clarity, robust input validation, and output rendering.

---

## Memory Bank System Configuration

**Memory Bank System:** Multi-file directory structure at `/Memory/` with subdirectories for each phase:
- `Memory/Phase_1_Project_Setup_Infrastructure/`
- `Memory/Phase_2_Core_UI_Implementation/`
- `Memory/Phase_3_Testing_Polish/`
- `Memory/Phase_4_Full_UI_Mock_Execution/`
- `Memory/Phase_5_Working_JS_Implementation/`

Each phase directory will contain individual log files for each task (e.g., `Task_1.1_React_Project_Init_Log.md`). This structure aligns with the phased approach and multiple specialized agents working on distinct aspects of the implementation.

---

## Note on Handover Protocol

For long-running projects or situations requiring context transfer (e.g., exceeding LLM context limits, changing specialized agents), the APM Handover Protocol should be initiated. This ensures smooth transitions and preserves project knowledge. Detailed procedures are outlined in the framework guide:

`prompts/01_Manager_Agent_Core_Guides/05_Handover_Protocol_Guide.md`

The current Manager Agent or the User should initiate this protocol as needed.