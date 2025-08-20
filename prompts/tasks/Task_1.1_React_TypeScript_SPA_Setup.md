# APM Task Assignment: React/TypeScript SPA Setup

## 1. Agent Role & APM Context

You are activated as an Implementation Agent within the Agentic Project Management (APM) framework for the ToolVault project. Your role is to execute assigned tasks diligently and log work meticulously to the project's [Memory_Bank.md](../../Memory_Bank.md) file. You will interact with the Manager Agent (via the User) and contribute to the centralized knowledge base through detailed logging.

## 2. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to `Phase 1, Task 1.1` in the [Implementation_Plan.md](../../Implementation_Plan.md).

**Objective:** Establish the core frontend application infrastructure using modern web development tools to support the JavaScript tool bundle created in Phase 0.

**Detailed Action Steps:**

1. **Initialize React/TypeScript project with Vite**
   - Navigate to the project root directory
   - Run `npm create vite@latest toolvault-frontend -- --template react-ts` 
   - Move into the new directory: `cd toolvault-frontend`
   - Configure TypeScript with strict mode enabled in `tsconfig.json`
   - Set up project directory structure:
     - `/src/components` - React components
     - `/src/services` - Tool loading and execution services  
     - `/src/types` - TypeScript interface definitions
     - `/src/utils` - Utility functions
   - Configure Vite for development and production builds with proper base path settings

2. **Install and configure essential dependencies**
   - Add React Router for client-side routing: `npm install react-router-dom @types/react-router-dom`
   - Add utility libraries: `npm install lodash date-fns @types/lodash`
   - Configure ESLint and Prettier for code consistency
   - Set up package.json scripts for development workflow

3. **Set up development environment**
   - Create `.vscode/settings.json` and `.vscode/extensions.json` for consistent development
   - Set up npm scripts for dev, build, test, and lint in package.json
   - Create basic folder structure and initial components:
     - `src/App.tsx` - Main application component
     - `src/components/Layout/` - Layout components
     - `src/services/toolService.ts` - Tool loading service (prepared for Phase 0 integration)
   - Initialize git repository if needed and create `.gitignore`

**Provide Necessary Context/Assets:**
- The application must be designed to integrate with the JavaScript tool bundle from `examples/javascript-bundle/`
- Reference `examples/javascript-bundle/index.json` for understanding tool metadata structure
- The frontend will need to support the IIFE pattern tools from Phase 0
- All tools from Phase 0 use the `window.ToolVault.tools` namespace
- Do not include axios - use native fetch() and direct imports for bundle integration

## 3. Expected Output & Deliverables

**Define Success:** A fully functional React/TypeScript application with Vite build system that can serve as the foundation for integrating Phase 0 JavaScript tools.

**Specify Deliverables:**
- Working React/TypeScript application in `/toolvault-frontend` directory
- Properly configured `package.json` with required dependencies (no axios)
- TypeScript configuration with strict mode enabled
- ESLint and Prettier configuration files
- Basic component structure and routing setup
- Development scripts that run without errors: `npm run dev`, `npm run build`, `npm run lint`

## 4. Memory Bank Logging Instructions

Upon successful completion of this task, you **must** log your work comprehensively to the project's [Memory_Bank.md](../../Memory_Bank.md) file. Adhere strictly to the established logging format. Ensure your log includes:
- A reference to Phase 1, Task 1.1 in the Implementation Plan
- A clear description of the React/TypeScript setup actions taken
- Key configuration decisions made (TypeScript settings, dependencies chosen)
- Any challenges encountered during setup
- Confirmation of successful execution (dev server running, build succeeds)

## 5. Clarification Instruction

If any part of this task assignment is unclear, please state your specific questions before proceeding.