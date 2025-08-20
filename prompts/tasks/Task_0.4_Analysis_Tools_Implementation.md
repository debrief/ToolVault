# APM Task Assignment: Analysis Tools Implementation

## 1. Agent Role & APM Context

You are continuing as an Implementation Agent within the Agentic Project Management (APM) framework for the ToolVault project, now focusing on temporal analysis capabilities for GPS tracks and time series calculations.

## 2. Onboarding / Context from Prior Work

**Prerequisites:** This task builds upon the completed work from:
- Task 0.1: Project structure and Jest framework established
- Task 0.2: Transform tools implemented with IIFE pattern
- Task 0.3: Comprehensive testing framework established for tool validation

**Connection to Prior Work:** You will now implement temporal analysis tools using the same IIFE pattern and project structure established in previous tasks. These tools will work with GPS track data and extend the functionality beyond geometric transformations to temporal calculations.

## 3. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to `Phase 0, Task 0.4 - Analysis Tools Implementation` in the [Implementation_Plan.md](../../Implementation_Plan.md).

**Objective:** Implement temporal analysis tools for GPS tracks and time series calculations.

**Detailed Action Steps:**

1. **Implement Calculate Speed Series tool:**
   - Create `tools/analysis/speed-series.js` for temporal speed calculations
   - Parse timestamps from GeoJSON LineString coordinates (if 3D/4D) or feature properties
   - Calculate speed between consecutive points with configurable time_unit parameter (seconds, minutes, hours)
   - Return structured JSON time series with timestamp/speed pairs
   - **Critical Guidance:** Handle different timestamp formats including ISO 8601 strings and Unix epoch timestamps
   - Implement robust timestamp parsing with format detection and validation
   - Use haversine formula for accurate distance calculations between GPS points

2. **Implement Calculate Direction Series tool:**
   - Create `tools/analysis/direction-series.js` for bearing/heading calculations
   - Calculate bearing (compass direction) between consecutive GPS points using forward azimuth
   - Support smoothing parameter with configurable window_size for moving average smoothing
   - Return structured JSON time series with timestamp/direction pairs (0-360 degrees)
   - Apply smoothing algorithms (moving average) when window_size parameter is provided
   - Ensure direction values are properly normalized to 0-360° range

3. **Handle temporal data edge cases:**
   - Validate timestamp presence and format consistency in input data
   - Handle irregular time intervals and missing data points gracefully
   - Implement comprehensive error handling for invalid temporal sequences
   - Support different coordinate systems with proper projection handling
   - Add validation for minimum point requirements (need at least 2 points for calculations)
   - Handle zero-distance movements and stationary periods appropriately

**Provide Necessary Context/Assets:**

- **Temporal Data Formats:** Support common GPS tracking formats with timestamps in coordinates array [lon, lat, elevation, timestamp] or in feature properties
- **Time Unit Conversions:** Implement conversions between seconds, minutes, and hours for speed calculations
- **Smoothing Algorithms:** Use simple moving average for direction smoothing with configurable window sizes
- **IIFE Pattern:** Follow the same pattern established in Task 0.2 for tool registration
- **Sample Data:** Leverage sample GPS track data from Task 0.1 for testing and validation

## 4. Expected Output & Deliverables

**Define Success:** Successful completion means having two working temporal analysis tools that can process GPS track data with timestamps and produce accurate time series outputs for speed and direction calculations.

**Specify Deliverables:**
- `tools/analysis/speed-series.js` - Speed calculation tool with multiple time unit support
- `tools/analysis/direction-series.js` - Direction/bearing tool with optional smoothing
- Both tools properly registered in `window.ToolVault.tools` namespace using IIFE pattern
- Comprehensive timestamp format support (ISO 8601, Unix epoch)
- Robust error handling for temporal data edge cases
- Mathematical accuracy validated against reference calculations
- Time series output in structured JSON format with metadata

**Format:** JavaScript files following established IIFE pattern with proper temporal data handling and time series output generation.

## 5. Memory Bank Logging Instructions

Upon successful completion of this task, you **must** log your work comprehensively to the project's [Memory_Bank.md](../../Memory_Bank.md) file.

Adhere strictly to the established logging format. Ensure your log includes:
- A reference to the assigned task in the Implementation Plan (Phase 0, Task 0.4)
- A clear description of temporal analysis algorithms implemented
- Code snippets showing timestamp parsing and time series generation logic
- Key decisions made regarding time format support and edge case handling
- Mathematical approaches used for speed and direction calculations
- Smoothing algorithm implementation details
- Any challenges encountered with temporal data processing
- Validation results against sample GPS track data
- Confirmation of successful execution (tools producing accurate time series outputs)

## 6. Clarification Instruction

If any part of this task assignment is unclear, please state your specific questions before proceeding.