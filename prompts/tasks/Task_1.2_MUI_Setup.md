# APM Task Assignment: Install and Configure Material-UI

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 1, Task 1.2** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Integrate Material-UI (MUI) component library with custom theming for the ToolVault application.

**Prerequisites:** This task builds upon Task 1.1. Ensure the React TypeScript project is initialized in the `client/` directory with the development server running successfully.

## 2. Detailed Action Steps

1. **Install Material-UI dependencies:**
   - Navigate to the `client/` directory
   - Install core MUI packages:
     ```bash
     pnpm add @mui/material @emotion/react @emotion/styled
     ```
   - Install MUI icons package:
     ```bash
     pnpm add @mui/icons-material
     ```
   - Add Roboto font to `client/index.html` in the `<head>` section:
     ```html
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
     ```

2. **Create custom MUI theme:**
   - Create directory `client/src/theme/`
   - Create `client/src/theme/theme.ts` with ToolVault branding:
     ```typescript
     import { createTheme } from '@mui/material/styles';
     
     export const theme = createTheme({
       palette: {
         primary: {
           main: '#1976d2',
           light: '#42a5f5',
           dark: '#1565c0',
         },
         secondary: {
           main: '#dc004e',
           light: '#e33371',
           dark: '#9a0036',
         },
         background: {
           default: '#f5f5f5',
           paper: '#ffffff',
         },
       },
       typography: {
         fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
         h1: {
           fontSize: '2.5rem',
           fontWeight: 500,
         },
         h2: {
           fontSize: '2rem',
           fontWeight: 500,
         },
       },
       spacing: 8,
       shape: {
         borderRadius: 8,
       },
       breakpoints: {
         values: {
           xs: 0,
           sm: 600,
           md: 900,
           lg: 1200,
           xl: 1536,
         },
       },
     });
     ```

3. **Set up theme provider:**
   - Update `client/src/main.tsx` to wrap the app with ThemeProvider:
     ```typescript
     import { ThemeProvider } from '@mui/material/styles';
     import CssBaseline from '@mui/material/CssBaseline';
     import { theme } from './theme/theme';
     ```
   - Wrap the App component:
     ```typescript
     <React.StrictMode>
       <ThemeProvider theme={theme}>
         <CssBaseline />
         <App />
       </ThemeProvider>
     </React.StrictMode>
     ```
   - Create `client/src/contexts/ThemeContext.tsx` for future theme switching capability (stub implementation for now)

4. **Create base layout components:**
   - Create `client/src/components/layout/` directory
   - Create `AppBar.tsx` with ToolVault branding:
     - Use MUI AppBar and Toolbar components
     - Add ToolVault title/logo
     - Include placeholder for navigation items
   - Create `NavigationDrawer.tsx`:
     - Responsive drawer component using MUI Drawer
     - Include placeholder menu items
   - Create `Footer.tsx`:
     - Simple footer with copyright and version info
   - Create `MainLayout.tsx`:
     - Combine AppBar, NavigationDrawer, main content area, and Footer
     - Use MUI Container for proper spacing
     - Implement responsive behavior

## 3. Expected Output & Deliverables

**Success Criteria:**
- Material-UI fully integrated with the React project
- Custom theme applied consistently across the application
- Base layout components created and rendering correctly
- No TypeScript errors with strict mode enabled

**Deliverables:**
1. Installed MUI packages in package.json
2. Created `theme/theme.ts` with custom theme configuration
3. Updated `main.tsx` with ThemeProvider and CssBaseline
4. Created layout components (AppBar, NavigationDrawer, Footer, MainLayout)
5. Roboto font integrated in index.html
6. Application runs without errors and displays MUI components

## 4. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_1_Project_Setup_Infrastructure/Task_1.2_MUI_Setup_Log.md`

**Format:** Follow the format in `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_Setup_Specialist)
- Task reference (Phase 1 / Task 1.2)
- Summary of MUI integration
- Theme configuration choices
- Created components list
- Verification that the UI renders correctly

## 5. Clarification Instruction

If any part of this task is unclear, please ask before proceeding. Key areas:
- Specific branding colors or requirements
- Additional MUI components needed
- Layout specifications or mockups

Please acknowledge receipt and proceed with implementation.