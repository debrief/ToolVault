# APM Task Assignment: Initialize React TypeScript Project

## 1. Agent Role & APM Context

**Introduction:** You are activated as an Implementation Agent within the Agentic Project Management (APM) framework for the ToolVault project.

**Your Role:** As an Implementation Agent, you will execute specific tasks assigned to you based on the detailed project plan. Your responsibilities include understanding requirements, performing necessary actions (writing code, configuring systems), and meticulously documenting your work.

**Workflow:** You will receive task assignments from the User (prepared by the Manager Agent). You interact directly with the User and must log all significant activities to the Memory Bank upon task completion. The Memory Bank serves as the project's official log for tracking progress and maintaining context.

**Onboarding Reference:** For detailed information about the APM framework and your role, refer to `prompts/02_Utility_Prompts_And_Format_Definitions/Imlementation_Agent_Onboarding.md`.

## 2. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 1, Task 1.1** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Set up the foundational React project with TypeScript, Vite, and pnpm package manager.

**Detailed Action Steps:**

1. **Initialize Vite React TypeScript project:**
   - Navigate to the ToolVault root directory
   - Run `pnpm create vite client --template react-ts`
   - Navigate to the newly created `client` directory
   - Run `pnpm install` to install all dependencies
   - Verify the development server runs correctly with `pnpm dev`
   - Ensure the default React app loads at http://localhost:5173

2. **Configure TypeScript for strict mode:**
   - Open `client/tsconfig.json`
   - Ensure the following compiler options are set:
     ```json
     {
       "compilerOptions": {
         "strict": true,
         "noImplicitAny": true,
         "strictNullChecks": true,
         "strictFunctionTypes": true,
         "strictBindCallApply": true,
         "strictPropertyInitialization": true,
         "noImplicitThis": true,
         "alwaysStrict": true,
         "esModuleInterop": true,
         "skipLibCheck": true,
         "forceConsistentCasingInFileNames": true
       }
     }
     ```
   - Configure path aliases for cleaner imports by adding:
     ```json
     "baseUrl": "./src",
     "paths": {
       "@components/*": ["components/*"],
       "@utils/*": ["utils/*"],
       "@types/*": ["types/*"],
       "@hooks/*": ["hooks/*"],
       "@services/*": ["services/*"]
     }
     ```
   - Update `vite.config.ts` to support these path aliases using the `vite-tsconfig-paths` plugin:
     ```bash
     pnpm add -D vite-tsconfig-paths
     ```

3. **Set up project directory structure:**
   - Create the following directories inside `client/src/`:
     - `components/` - For React components
     - `types/` - For TypeScript interfaces and types
     - `utils/` - For utility functions
     - `hooks/` - For custom React hooks
     - `services/` - For API/data fetching logic
   - Create `client/public/data/` directory for the static index.json file
   - Copy the sample `index.json` from `samples/index.json` to `client/public/data/index.json`

4. **Configure development environment:**
   - Create `client/.env` file with initial environment variables:
     ```
     VITE_APP_TITLE=ToolVault
     VITE_API_BASE_URL=/data
     ```
   - Update `client/vite.config.ts` to ensure proper asset handling and HMR
   - Configure build optimization settings for production
   - Add a `.gitignore` entry for `.env.local` if not already present

**Additional Context:**
- The project uses pnpm as the package manager (not npm or yarn)
- TypeScript strict mode is essential for catching type errors early
- The path aliases will make imports cleaner throughout the project
- The sample index.json in `samples/` contains the data structure we'll be working with

## 3. Expected Output & Deliverables

**Define Success:** 
- A fully initialized React TypeScript project with Vite
- TypeScript configured in strict mode with path aliases
- Proper directory structure created
- Development server running successfully
- Sample index.json copied to the public/data directory

**Specific Deliverables:**
1. Created `client/` directory with React TypeScript Vite project
2. Modified `tsconfig.json` with strict mode and path aliases
3. Updated `vite.config.ts` with path alias support
4. Created all required subdirectories in `src/`
5. Created `.env` file with initial variables
6. Copied `index.json` to `public/data/`
7. Verification that `pnpm dev` runs without errors

## 4. Memory Bank Logging Instructions

**Instruction:** Upon successful completion of this task, you **must** log your work comprehensively to the Memory Bank file at:
`Memory/Phase_1_Project_Setup_Infrastructure/Task_1.1_React_Project_Init_Log.md`

**Format Adherence:** Adhere strictly to the format defined in `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Your log must include:
- Agent identifier (Agent_Setup_Specialist)
- Task reference (Phase 1 / Task 1.1)
- Clear summary of actions taken
- Key configuration choices made
- Confirmation of successful setup (dev server running)
- Any issues encountered and their resolutions

**Important:** Be concise yet informative. Focus on key actions and outcomes rather than verbose step-by-step descriptions.

## 5. Clarification Instruction

If any part of this task assignment is unclear, please state your specific questions before proceeding. Key areas to confirm:
- Location of the ToolVault root directory
- Access to pnpm package manager
- Location of sample files
- Any permission issues with creating directories

Please acknowledge receipt of this task assignment and proceed with implementation.