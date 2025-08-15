# Software Requirements Document (SRD) — ToolVault

## Overview

ToolVault is a portable, self-contained service delivering curated collections of analysis tools, with an interactive UI, versioning, and multiple deployment modes (standalone server, VS Code extension).

The initial implementation will be delivered in several phases, each building on the previous.

---

## Phase 1 — Bare Static UI

- Static single-page application (SPA) served via GitHub Pages.
- Reads a provided `index.json` describing available tools.
- Displays:
  - List of tools.
  - Tool detail page (description, input/output parameters).
  - Placeholder form for entering inputs.
  - "Run" button with mock execution.
  - History placeholder panel.
- No real execution — all outputs are mocked.

**Deliverables:**
- Static HTML/CSS/JS UI.
- `index.json` sample with at least 3 tools.
- Fully navigable browsing experience.

---

## Phase 2 — Mock Tool Calls

- UI "Run" button triggers simulated tool execution.
- Inputs are collected from the form based on parameter types.
- Outputs are generated via deterministic mock logic (e.g., fixed strings or computed from inputs).
- History panel shows each run with timestamp.

**Deliverables:**
- Mock execution logic.
- Validation of required parameters and types.
- Updated `index.json` to include types and descriptions for parameters and outputs.

---

## Phase 3 — Full Browsing UI with Output Rendering

- Expand UI to fully render tool outputs in relevant formats (tables, maps, charts).
- History panel displays results with rich formatting.
- Allow export of results (JSON, CSV, PNG where relevant).

---

## Phase 4 — Working JS Implementation

**Goal:** Execute real tools implemented in JavaScript/TypeScript, without any Python infrastructure.

- Tools are written in TypeScript, compiled to ES modules (single-file JS per tool).
- For now, tool implementations (`*.ts` source and compiled `*.js`) and `index.json` will be located in the **client's `src/` folder**.
- The SPA will:
  - Load `index.json`.
  - Dynamically `import()` the specified module for a tool.
  - Call its exported `run()` function with validated input parameters.
  - Render returned outputs in the UI.
- Execution occurs in a **Web Worker** to avoid blocking the UI.
- No network or Python runtime — all processing happens client-side.
- Input/output types are kept minimal but descriptive in `index.json`:
  ```json
  {
    "id": "change-color-to-red",
    "name": "Change feature color to red",
    "description": "Sets properties.color on a GeoJSON Feature (immutable).",
    "module": "./tools/change-color-to-red/dist/index.js",
    "params": [
      { "name": "feature", "type": "geojson:Feature", "required": true },
      { "name": "color", "type": "string", "default": "#ff0000" }
    ],
    "outputs": [
      { "name": "feature", "type": "geojson:Feature" },
      { "name": "changed", "type": "boolean" }
    ]
  }
  ```
- SPA validates inputs per `params` and outputs per `outputs`.
- Later phases will replace the embedded tools with dynamically indexed ones from a dedicated JS repository.

Some interesting other tools, which will usefully drive the interface:
- word-frequency: take paragraph of text, output table of work frequencies (word and count)
- flip-line: take a GeoJSON linestring, swap the order of the latitude coordinates, but leave the longitude coordinates unchanged.
- line-centre: take a GeoJSON linestring, output a GeoJSON point at the centre of the line (this doesn't need special spacial calcs - just do it arithmetically)
- calc-speeds: take a GeoJSON LineString that has a `properties.times` array of unix DTG, one per LineString point.  Use simply arithmetic to determine the time travelled between each pair of points. Divide that by the time interval between those points, to get speed. Output a time-series array of speeds.


**Deliverables:**
- Minimal tool catalog in `index.json`.
- At least two working tools implemented in TypeScript (e.g., `word-count`, `change-color-to-red`).
- Worker-based execution pipeline.
- Basic error handling.

---

## Phase 5 — Python Runtime Integration

- Introduce server or serverless Python runtime (Flask/FastAPI).
- Tools can declare `"runtime": "python"` in `index.json`.
- SPA dispatches such tools to the Python backend, passing validated inputs and receiving outputs in the same format.
- Preserve JS execution path for `"runtime": "js"`.

---

## Phase 6 — Remote Tool Indexing and Hosting

- Remove embedded tool implementations from the SPA.
- Implement an indexing service that scans a JS/Python tool repository and produces the `index.json` plus built tool artifacts.
- SPA fetches `index.json` and tool modules from the hosted artifact store.

---

## Phase 7 — Deployment Modes

- Standalone server mode (serving SPA + backend from one process).
- VS Code extension mode.
- Continue supporting static GH Pages mode for JS-only tools.

---

## Non-Goals (for now)

- Authentication/authorization.
- Persistent storage of execution history.
- Real-time collaboration.

---

## Glossary

- **Tool** — a functional unit that takes structured inputs, processes them, and returns structured outputs.
- **`index.json`** — a manifest describing available tools, their parameters, and outputs.
- **SPA** — Single Page Application.
- **Web Worker** — a browser feature for running JS in background threads.
