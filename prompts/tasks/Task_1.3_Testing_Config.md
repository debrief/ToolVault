# APM Task Assignment: Configure Testing Infrastructure

## 1. Agent Role & APM Context

**Introduction:** You are activated as Agent_Testing_Config within the APM framework for the ToolVault project.

**Your Role:** As a specialized testing configuration agent, you will set up comprehensive testing infrastructure including unit tests, component tests, and end-to-end tests for the React application.

## 2. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 1, Task 1.3** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Set up comprehensive testing framework with Jest, React Testing Library, and Playwright.

**Prerequisites:** Tasks 1.1 and 1.2 should be completed (React project initialized with MUI configured).

## 3. Detailed Action Steps

1. **Install and configure unit testing dependencies:**
   - Navigate to the `client/` directory
   - Install Jest and React Testing Library:
     ```bash
     pnpm add -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
     ```
   - Install TypeScript Jest support:
     ```bash
     pnpm add -D ts-jest @types/jest
     ```
   - Create `client/jest.config.js`:
     ```javascript
     module.exports = {
       preset: 'ts-jest',
       testEnvironment: 'jsdom',
       roots: ['<rootDir>/src'],
       setupFilesAfterEnv: ['<rootDir>/src/test-utils/setupTests.ts'],
       moduleNameMapper: {
         '^@components/(.*)$': '<rootDir>/src/components/$1',
         '^@utils/(.*)$': '<rootDir>/src/utils/$1',
         '^@types/(.*)$': '<rootDir>/src/types/$1',
         '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
         '^@services/(.*)$': '<rootDir>/src/services/$1',
       },
       collectCoverageFrom: [
         'src/**/*.{ts,tsx}',
         '!src/**/*.d.ts',
         '!src/main.tsx',
         '!src/vite-env.d.ts',
       ],
       coverageThreshold: {
         global: {
           branches: 80,
           functions: 80,
           lines: 80,
           statements: 80,
         },
       },
     };
     ```

2. **Set up component testing utilities:**
   - Create `client/src/test-utils/` directory
   - Create `setupTests.ts`:
     ```typescript
     import '@testing-library/jest-dom';
     ```
   - Create `test-utils.tsx` with custom render function:
     ```typescript
     import { ReactElement } from 'react';
     import { render, RenderOptions } from '@testing-library/react';
     import { ThemeProvider } from '@mui/material/styles';
     import { theme } from '../theme/theme';
     
     const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
       return (
         <ThemeProvider theme={theme}>
           {children}
         </ThemeProvider>
       );
     };
     
     const customRender = (
       ui: ReactElement,
       options?: Omit<RenderOptions, 'wrapper'>,
     ) => render(ui, { wrapper: AllTheProviders, ...options });
     
     export * from '@testing-library/react';
     export { customRender as render };
     ```
   - Create mock data generators in `client/src/test-utils/mockData.ts`
   - Install and configure MSW for API mocking:
     ```bash
     pnpm add -D msw
     ```

3. **Configure E2E testing with Playwright:**
   - Install Playwright:
     ```bash
     pnpm add -D @playwright/test
     ```
   - Create `client/playwright.config.ts`:
     ```typescript
     import { defineConfig, devices } from '@playwright/test';
     
     export default defineConfig({
       testDir: './e2e',
       fullyParallel: true,
       forbidOnly: !!process.env.CI,
       retries: process.env.CI ? 2 : 0,
       workers: process.env.CI ? 1 : undefined,
       reporter: 'html',
       use: {
         baseURL: 'http://localhost:5173',
         trace: 'on-first-retry',
       },
       projects: [
         {
           name: 'chromium',
           use: { ...devices['Desktop Chrome'] },
         },
         {
           name: 'firefox',
           use: { ...devices['Desktop Firefox'] },
         },
         {
           name: 'webkit',
           use: { ...devices['Desktop Safari'] },
         },
       ],
       webServer: {
         command: 'pnpm dev',
         url: 'http://localhost:5173',
         reuseExistingServer: !process.env.CI,
       },
     });
     ```
   - Create `client/e2e/` directory for E2E tests
   - Set up page objects pattern in `client/e2e/pages/`
   - Configure visual regression testing capabilities

4. **Create testing scripts and CI configuration:**
   - Update `client/package.json` with test scripts:
     ```json
     {
       "scripts": {
         "test": "jest",
         "test:watch": "jest --watch",
         "test:coverage": "jest --coverage",
         "test:e2e": "playwright test",
         "test:e2e:ui": "playwright test --ui"
       }
     }
     ```
   - Create `.github/workflows/ci.yml` for GitHub Actions:
     ```yaml
     name: CI
     on: [push, pull_request]
     jobs:
       test:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v3
           - uses: pnpm/action-setup@v2
           - uses: actions/setup-node@v3
             with:
               node-version: '18'
               cache: 'pnpm'
           - run: pnpm install
           - run: pnpm test:coverage
           - run: pnpm build
           - run: pnpm test:e2e
     ```
   - Install and configure Husky for pre-commit hooks:
     ```bash
     pnpm add -D husky
     pnpm exec husky init
     ```
   - Configure coverage thresholds at 80% minimum

## 4. Expected Output & Deliverables

**Success Criteria:**
- Jest configured with TypeScript support
- React Testing Library integrated with custom render
- Playwright configured for E2E testing
- CI/CD pipeline configured
- All test commands working correctly

**Deliverables:**
1. Jest configuration file
2. Test utilities and setup files
3. Playwright configuration
4. GitHub Actions workflow
5. Updated package.json with test scripts
6. Husky pre-commit hooks
7. Sample test files demonstrating the setup works

## 5. Memory Bank Logging Instructions

**Instruction:** Log your work to:
`Memory/Phase_1_Project_Setup_Infrastructure/Task_1.3_Testing_Config_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_Testing_Config)
- Task reference (Phase 1 / Task 1.3)
- Testing frameworks configured
- Coverage thresholds set
- CI/CD pipeline status
- Any configuration challenges resolved

## 6. Clarification Instruction

Please ask if you need clarification on:
- Specific testing requirements
- Coverage threshold adjustments
- Additional testing tools needed

Acknowledge receipt and proceed with implementation.