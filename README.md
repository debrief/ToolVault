# ToolVault

ToolVault is a portable, self-contained service that delivers curated collections of analysis tools
for scientists, analysts, and developers. It provides an interactive browser-based interface for
discovering, running, and understanding tools — complete with history, legacy version access, and
spatial output visualisation.

## Key Features
- **Curated Tool Collections** – Tools packaged with all their dependencies in a zip bundle.
- **Self-Describing** – Each bundle contains metadata (`index.json`) describing the tools, inputs, outputs, and history.
- **Interactive UI** – Browse tools, configure inputs, run them, and view outputs directly in the browser.
- **Version Awareness** – Access and run specific historical versions of a tool.
- **Spatial Rendering** – LeafletJS visualisation for spatial outputs (e.g., GeoJSON FeatureCollections).
- **Jupyter Integration** – Embedded notebook server for viewing and running demo notebooks for each tool.
- **Multiple Delivery Modes** – Runs as a standalone Flask/FastAPI server or as a VS Code extension.

## Current Phase
We are in the **early UI mockup phase**, focusing on:
1. Building a **bare static UI** driven by `index.json`.
2. Adding **mock tool calls** to simulate execution.
3. Implementing the **full browsing UI** with output rendering (including LeafletJS).

## Planned Roadmap
1. **Phase 1 – UI Mockup**  
   - Bare static UI from `index.json` (browse tools, view details, inputs/outputs, run button).  
   - Mock tool calls with placeholder outputs.  
   - Full browsing UI with LeafletJS output rendering and history view placeholder.  

2. **Phase 2 – Indexer Development**  
   - ToolVault indexer to scan a Git repo of tools, generate `index.json` and metadata.  
   - Bundle dependencies, notebooks, and metadata into a zip for offline use.  

3. **Phase 3 – Backend Service**  
   - Flask/FastAPI service that loads bundles and exposes tools via a REST API.  
   - Embedded Jupyter server for running demo notebooks.  

4. **Phase 4 – VS Code Integration**  
   - ToolVault available as a VS Code extension, integrated into the Debrief UI.  

## Repository Structure (proposed)
```
/client         # SPA frontend
/server         # Flask/FastAPI backend
/indexer        # Bundle creation scripts
/docs           # Documentation and design notes
/examples       # Example tool bundles
README.md
```

## License
TBD – likely permissive open source license to encourage adoption.
