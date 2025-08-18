# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ToolVault is a portable, self-contained service that delivers curated collections of analysis tools for scientists, analysts, and developers. It provides an interactive browser-based interface for discovering, running, and understanding tools with history tracking, version awareness, and spatial output visualization.

## Project Structure

### Current Structure
```
/docs           # Documentation including software requirements
/docs/ADRs      # Architecture Decision Records
/prompts        # APM (Agentic Project Management) framework guides
/tasks          # Task tracking directory
```

### Planned Structure
```
/client         # SPA frontend (to be created)
/server         # Flask/FastAPI backend (to be created)
/indexer        # Bundle creation scripts (to be created)
/examples       # Example tool bundles (to be created)
```

## Key Technologies

### Frontend (Planned)
- Single Page Application (SPA)
- LeafletJS for spatial data visualization
- Metadata-driven UI from `index.json`

### Backend (Planned)
- Flask or FastAPI for REST API
- Embedded Jupyter server for notebooks
- Python-based tool execution

## Architecture Decisions

### Key Constraints
- **Offline capability**: All dependencies must be packaged in bundles
- **50 MB cap** for initial bundles
- **No authentication** in early phases
- **LeafletJS** preferred for spatial rendering

## APM Framework

This project uses an Agentic Project Management (APM) framework for AI-assisted development. Key APM assets include:
- Implementation plans
- Memory banks for tracking decisions
- Task assignment prompts
- Handover protocols for context transfer

When working with APM artifacts, refer to guides in `/prompts/01_Manager_Agent_Core_Guides/`.

## Development Commands

Since no implementation exists yet, here are the anticipated commands for each component:

### Frontend (Future)
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Backend (Future)
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py  # or: uvicorn main:app --reload

# Run tests
pytest

# Format code
black .

# Lint code
ruff check .
```

### Indexer (Future)
```bash
# Generate bundle from repository
python indexer.py --repo /path/to/tools --output bundle.zip

# Validate index.json
python validate_index.py index.json
```

## Important Notes

- The project uses Python for backend development with Flask/FastAPI preference
- Frontend should be framework-agnostic initially but production-ready
- All code should support offline operation without internet connectivity
- Spatial outputs should be rendered using LeafletJS
- The VS Code extension will integrate with the Debrief themed distribution