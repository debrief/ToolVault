# APM Task Assignment: Implement Additional JS Tools for UI Demonstration

## 1. Agent Role & APM Context

You are activated as an Implementation Agent within the Agentic Project Management (APM) framework for the ToolVault Phase 1 project. Your responsibility is to implement and integrate additional JavaScript tools to drive and demonstrate the user interface, as described in the software requirements and Implementation Plan.

## 2. Task Assignment

This assignment corresponds to **Phase 5, Task 5.5** in the [Implementation_Plan.md](../../Implementation_Plan.md).

**Objective:**
Implement and integrate a set of additional JavaScript tools to drive and demonstrate the user interface.

**Detailed Action Steps:**
1. Implement the following tools as TypeScript modules, compile to ES modules, and register in `index.json`:
    - `word-frequency`: Accepts a paragraph of text, outputs a table of word frequencies (word and count).
    - `flip-line`: Accepts a GeoJSON LineString, swaps the order of the latitude coordinates, leaving longitude unchanged.
    - `line-centre`: Accepts a GeoJSON LineString, outputs a GeoJSON Point at the centre of the line (arithmetic mean, not spatial).
    - `calc-speeds`: Accepts a GeoJSON LineString with a `properties.times` array of unix DTG (one per point), computes speed for each segment (distance/time), outputs a time-series array of speeds.
2. For each tool:
    - Ensure input/output types are minimal but descriptive, and update `index.json` accordingly.
    - Follow the same module structure and conventions as previous tool tasks (Task 5.1, 5.4).
    - Validate inputs and outputs per the schema and UI contract.
    - Add documentation for each tool, including usage and input/output contract.
    - Provide at least one test case per tool.
3. Integrate these tools into the SPA so they are discoverable and executable via the UI.
    - Ensure outputs render correctly using the existing output rendering pipeline.
    - Validate correct error handling and UI feedback for edge cases and invalid input.

**Guidance:**
Refer to the Software Requirements Document (SRD) and the sample tool entries in `index.json` for structure and contract. Tools should help drive development and demonstration of the interface, so prioritize clarity, robust input validation, and output rendering.

## 3. Expected Output & Deliverables
- All four tools implemented as TypeScript modules and compiled to ES modules.
- Corresponding entries in `index.json` with minimal, descriptive input/output types.
- Documentation for each tool (usage, contract, test case).
- Integration into the SPA with discoverable and executable UI.
- Outputs rendered correctly and error handling validated.

## 4. Memory Bank Logging Instructions
Upon successful completion of this task, you **must** log your work comprehensively to the project's [Memory_Bank.md](../../Memory_Bank.md) file. Adhere strictly to the established logging format. Ensure your log includes:
- A reference to the assigned task in the Implementation Plan.
- A clear description of the actions taken.
- Any code snippets generated or modified.
- Any key decisions made or challenges encountered.
- Confirmation of successful execution (e.g., tests passing, output generated).

If a dedicated [Memory_Bank_Log_Format.md](../02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md) file exists, reference it directly.

## 5. Clarification Instruction
If any part of this task assignment is unclear, please state your specific questions before proceeding.
