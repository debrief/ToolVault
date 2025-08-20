# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ToolVault is a portable, self-contained service that delivers curated collections of analysis tools for scientists, analysts, and developers. It provides an interactive browser-based interface for discovering, running, and understanding tools version awareness, and spatial output visualization.

## Project Structure

### Current Implementation
```
/docs/                        # Documentation including software requirements
├── ADRs/                    # Architecture Decision Records 
├── software_requirements.md
├── phase_plan.md
└── ui/readme.md

/toolvault-frontend/         # React/TypeScript SPA frontend (Phase 1 - ACTIVE)
├── src/components/          # UI components for tool browsing and execution
├── src/services/            # Bundle loading, tool registry, search
├── src/types/tools.ts       # TypeScript interfaces for tool metadata
├── public/examples/         # Symlinked JavaScript bundle for dev
├── tests/e2e/               # Playwright end-to-end tests
└── package.json            # Vite, React, TypeScript, Playwright config

/examples/javascript-bundle/ # Phase 0 JavaScript tools (COMPLETE)
├── tools/                   # JavaScript tool implementations using IIFE pattern
├── tests/                   # Jest test files with 100% coverage
├── index.json              # Tool metadata for UI generation
└── package.json            # Jest testing configuration

/prompts/                    # APM (Agentic Project Management) framework
├── tasks/                   # Task Assignment Prompts
└── 01_Manager_Agent_Core_Guides/
```

### Planned Structure
```
/server         # Flask/FastAPI backend (Phase 3) 
/indexer        # Bundle creation scripts (Phase 2)
```

## Current Development Phase

**Phase 1: React/TypeScript Frontend** (ACTIVE)
- React/TypeScript SPA with metadata-driven UI generation in `toolvault-frontend/`
- Integration with Phase 0 JavaScript tools bundle
- Complete JavaScript tool bundle with 12 tools across 5 categories in `examples/javascript-bundle/`
- Tools use IIFE pattern and register in `window.ToolVault.tools` namespace
- Full Jest test suite with 100% coverage requirement achieved
- Comprehensive `index.json` metadata for frontend integration

## Architecture Decisions

### Key Architectural Patterns
- **Metadata-driven UI**: All interfaces generated from `index.json` (ADR-001)
- **Bundle-based distribution**: Self-contained tool packages (ADR-003)
- **IIFE tool pattern**: JavaScript tools use Immediately Invoked Function Expression pattern (ADR-013)
- **Offline-first**: All dependencies packaged in bundles
- **LeafletJS for spatial**: Preferred for GeoJSON visualization (ADR-005)

### Tool Implementation Pattern (JavaScript Bundle)
```javascript
(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.toolName = function(input, params) {
    // Tool implementation
    return result;
  };
})();
```

## Development Commands

### Frontend Development (Primary Workflow)
```bash
cd toolvault-frontend

# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Run type checking
yarn typecheck

# Run ESLint
yarn lint

# Run end-to-end tests
yarn test:e2e

# Preview production build
yarn preview
```

### JavaScript Bundle Testing (Phase 0 Tools)
```bash
cd examples/javascript-bundle

# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx jest tests/transform/translate.test.js

# Generate coverage report
npx jest --coverage

# Run linting
npm run lint

# Validate bundle structure
npm run validate
```

### Frontend Architecture Patterns

The React/TypeScript frontend follows these key patterns:

**Metadata-Driven UI Generation:**
- All tool interfaces generated from `index.json` metadata (ADR-001)
- Dynamic form generation based on parameter schemas
- No hard-coded tool-specific UI components

**Service Layer Architecture:**
- `bundleLoader.ts`: Loads and caches tool bundles from Phase 0
- `toolRegistry.ts`: In-memory registry for tool discovery and filtering  
- `toolService.ts`: Executes JavaScript tools via `window.ToolVault.tools[id]`
- `toolSearch.ts`: Fuzzy search across tool metadata

**Component Structure:**
- `ToolBrowser/`: Grid/list views for tool discovery
- `SearchInterface/`: Search bar and filtering components
- Layout components with consistent styling

### APM Framework Usage
The project uses an Agentic Project Management (APM) framework with specialized agents:
- **Agent_JS_Dev**: JavaScript tool implementation (Phase 0 complete)
- **Agent_Test_Specialist**: Comprehensive testing with 100% coverage
- **Agent_Frontend_Lead**: React/TypeScript frontend (Phase 1 active)

Task Assignment Prompts (TAPs) are in `/prompts/tasks/` and follow the pattern `Task_X.Y_Description.md`.

## Tool Categories and Metadata

The JavaScript bundle implements 12 tools across 5 categories:

1. **Transform**: `translate-features`, `flip-horizontal`, `flip-vertical`
2. **Analysis**: `calculate-speed-series`, `calculate-direction-series`
3. **Statistics**: `average-speed`, `speed-histogram`
4. **Processing**: `smooth-polyline`
5. **I/O**: `import-rep`, `export-rep`, `export-csv`

All tools are defined in `examples/javascript-bundle/index.json` with complete metadata including:
- Input/output specifications
- Parameter schemas with defaults and validation
- Runtime type ("javascript")
- Category and tag classifications

## Testing Strategy

### Coverage Requirements
- **100% code coverage** across all tool implementations
- Mathematical validation against reference data
- Edge case handling for coordinate systems, temporal data
- Integration testing for IIFE pattern tool loading
- Performance benchmarks for large datasets

### Test File Organization
```
/tests
├── transform/          # Geometric transformation tests
├── analysis/           # Temporal analysis tests
├── statistics/         # Statistical calculation tests
├── processing/         # Data processing tests
├── io/                 # Import/export tests
└── integration/        # Cross-tool integration tests
```

## Key Files and Their Purposes

### Development Planning
- `Implementation_Plan.md`: 12-week development roadmap across 4 phases
- `prompts/tasks/Task_1.X_*.md`: Current Phase 1 frontend development tasks
- `Memory/README.md`: Project memory and decision tracking

### Frontend Architecture  
- `toolvault-frontend/src/types/tools.ts`: TypeScript interfaces for tool metadata
- `toolvault-frontend/src/services/bundleLoader.ts`: Phase 0 bundle integration
- `toolvault-frontend/vite.config.ts`: Build configuration with GitHub Pages support
- `toolvault-frontend/package.json`: Dependencies and build scripts

### Tool Implementation
- `examples/javascript-bundle/index.json`: Complete tool metadata for UI generation
- `examples/javascript-bundle/tools/`: IIFE pattern JavaScript tool implementations
- `examples/javascript-bundle/tests/`: Jest test suite with 100% coverage

### Documentation
- `docs/ADRs/ADR-001-metadata-driven-architecture.md`: Core architectural decision
- `docs/ADRs/ADR-013-mock-javascript-toolset.md`: JavaScript tool implementation specification

## Important Notes

### Current Architecture
- **Frontend**: React/TypeScript SPA with Vite build system and metadata-driven UI generation
- **Tools**: Phase 0 JavaScript tools executed in browser via IIFE pattern  
- **Build System**: Vite for frontend, Jest for JavaScript tool testing
- **Testing**: Playwright for E2E tests, Jest for unit tests with 100% coverage requirement
- **Styling**: CSS modules with component-scoped styles

### Technical Details
- All code supports offline operation without internet connectivity
- JavaScript tools use spherical geometry for accurate GPS calculations
- Temporal analysis tools support multiple timestamp formats (ISO 8601, Unix epoch)
- Bundle loading supports caching with fallback mechanisms
- TypeScript strict mode enabled with comprehensive type checking

### Future Integration
- Backend will use Python with Flask/FastAPI preference (Phase 3)
- Spatial outputs will be rendered using LeafletJS (planned)
- ToolVault will be consumed by Debrief and delivered as VS Code extensions
- MCP (Model Context Protocol) integration planned for AI tool execution

## Development Guidelines

### Code Quality
- TypeScript strict mode enforced with no `any` types allowed
- ESLint configured for strict checking with pre-push hooks via Husky
- 100% test coverage requirement for all JavaScript tools
- Playwright E2E tests verify core functionality

### File Management
- Always prefer editing existing files over creating new ones
- Never proactively create documentation files unless explicitly requested
- Focus on implementation over documentation during development phases