# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ToolVault is a portable, self-contained service that delivers curated collections of analysis tools for scientists, analysts, and developers. It provides an interactive browser-based interface for discovering, running, and understanding tools with history tracking, version awareness, and spatial output visualization.

## Project Structure

### Current Implementation
```
/docs                          # Documentation including software requirements
/docs/ADRs                    # Architecture Decision Records 
/prompts                      # APM (Agentic Project Management) framework guides
/prompts/tasks               # Task Assignment Prompts for Phase 0 implementation
/examples/javascript-bundle  # Mock JavaScript tool implementation (ACTIVE)
├── tools/                   # JavaScript tool implementations using IIFE pattern
├── data/                    # Sample GeoJSON data files
├── tests/                   # Jest test files
├── index.json              # Tool metadata for UI generation
└── package.json            # Jest testing configuration
```

### Planned Structure
```
/client         # React/TypeScript SPA frontend (Phase 1)
/server         # Flask/FastAPI backend (Phase 3) 
/indexer        # Bundle creation scripts (Phase 2)
```

## Current Development Phase

**Phase 0: JavaScript Mock Tools** (ACTIVE)
- Complete JavaScript tool bundle with 12 tools across 5 categories
- Tools use IIFE pattern and register in `window.ToolVault.tools` namespace
- Full Jest test suite with 100% coverage requirement
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

### JavaScript Bundle Testing
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
```

### APM Framework Usage
The project uses an Agentic Project Management (APM) framework with specialized agents:
- **Agent_JS_Dev**: JavaScript tool implementation
- **Agent_Test_Specialist**: Comprehensive testing with 100% coverage
- **Agent_Frontend_Lead**: React/TypeScript frontend (Phase 1)

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

- `Implementation_Plan.md`: 12-week development roadmap across 4 phases
- `examples/javascript-bundle/index.json`: Complete tool metadata for Phase 1 UI generation
- `prompts/tasks/Task_0.X_*.md`: Detailed task assignments for Phase 0 completion
- `Memory_Bank.md`: Centralized logging for all agent work and decisions (if exists)
- `docs/ADRs/ADR-013-mock-javascript-toolset.md`: JavaScript tool implementation specification

## Important Notes

- The project uses Python for backend development with Flask/FastAPI preference
- Frontend will be React/TypeScript SPA with metadata-driven UI generation
- All code supports offline operation without internet connectivity
- Spatial outputs are rendered using LeafletJS
- In the future ToolVault will be consumed by Debrief, delivered as VS Code extensions
- JavaScript tools in Phase 0 use spherical geometry for accurate GPS calculations
- All temporal analysis tools support multiple timestamp formats (ISO 8601, Unix epoch)