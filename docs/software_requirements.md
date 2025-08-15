# ToolVault Software Requirements Document (SRD)

## 1. Overview
ToolVault is a portable, self-contained service providing a curated set of analysis tools.
It ships as either:
- A standalone server (Flask/FastAPI with embedded Jupyter server), or
- A VS Code extension (for Debrief integration).

ToolVault consumes **zip bundles** containing Python tools, dependencies, metadata, and notebooks.
Bundles are indexed and browsable via a **metadata-driven UI**, allowing analysts to discover, run, and review tools.

## 2. Phases

### Phase 1 — Bare Static UI (Metadata-Driven)
**Goal:** Deliver a basic Single Page Application (SPA) that consumes an `index.json` file and provides minimal tool browsing.

**Features:**
- Load `index.json` from local file (no backend).
- Browsable list of tools.
- Tool detail page with:
  - Display of tool name, description, inputs, outputs.
  - UI for defining inputs and outputs.
  - “Run” button (non-functional at this stage).
  - Placeholder for execution history.
- Fixed styling/layout to validate basic structure.

---

### Phase 2 — Mock Tool Calls
**Goal:** Demonstrate full execution UI flow using simulated backend responses.

**Features:**
- REST mock server providing canned responses for:
  - Tool list.
  - Tool execution results.
  - Tool history.
- SPA wired to mock API:
  - “Run” triggers fake execution, returns sample outputs.
  - Outputs displayed in placeholder components.
- Enables iterative UI refinement without real tool execution.

---

### Phase 3 — Full Browsing UI with Output Rendering
**Goal:** Deliver production-grade UI, with LeafletJS visualisation for spatial outputs.

**Features:**
- Search and filter tools (e.g., by type, category, “new”, “updated”).
- “New” and “Updated” badges based on metadata timestamps.
- Detailed output viewers:
  - **Spatial outputs:** LeafletJS map rendering from GeoJSON.
  - **Tabular outputs:** Interactive tables with sorting/filtering.
  - **Charts:** Basic plots for numeric outputs.
- History viewer UI populated with mock or real data.
- Responsive layout for desktop and dual-monitor workflows.

---

### Phase 4 — Indexer Development
**Goal:** Build the indexer to generate ToolVault bundles.

**Features:**
- Parse a Git repository of Python tools.
- Auto-generate `index.json` matching Phase 3’s metadata schema.
- Include:
  - Tool definitions.
  - Input/output schema.
  - Commit SHA + commit DTG.
  - Notebook paths.
  - Execution history placeholders.
- Package all dependencies (including notebooks, data samples) into a single zip bundle.
- Support multiple repositories (separate bundles per repo).

---

### Phase 5 — Flask/FastAPI ToolVault Service with Embedded Jupyter
**Goal:** Provide live tool execution and notebook viewing.

**Features:**
- Load zip bundle produced by indexer.
- Serve `index.json` and metadata via REST.
- Execute tools on demand:
  - Pass input parameters to Python modules.
  - Return outputs in agreed format.
  - Include PROV metadata in all responses.
- On-demand embedded Jupyter server for viewing/running `demo.ipynb` for each tool.
- Capable of running offline with no internet connection.

---

### Phase 6 — VS Code Extension Integration
**Goal:** Integrate ToolVault into Debrief (VS Code themed distribution).

**Features:**
- ToolVault panel in VS Code for browsing and running tools.
- Uses same REST API as standalone service.
- Supports loading local bundles or connecting to running service.
- Allows Debrief to:
  - Pass selected GeoJSON features to tools.
  - Receive updated features and mark editor as “modified”.

---

## 3. Constraints
- **Offline capability**: All dependencies packaged in bundle.
- **No authentication** in early phases (may be added later).
- **50 MB cap** for initial bundles.
- **LeafletJS** preferred for spatial rendering in UI.
- **Metadata-first design**: Metadata schema fixed in early phases before backend work.

## 4. Deliverables
1. Metadata-driven SPA (Phases 1–3).
2. Indexer for bundle creation (Phase 4).
3. Flask/FastAPI service with embedded Jupyter (Phase 5).
4. VS Code extension integration (Phase 6).
