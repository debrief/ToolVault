# ADR-013: Mock JavaScript Toolset for UI Development

## Status
Proposed

## Context
To accelerate UI development and gather user feedback, we need a working ToolVault instance with real tools that can execute in the browser. Rather than waiting for Python backend implementation, we can create a JavaScript-based tool bundle that demonstrates the full user experience while validating the metadata-driven architecture.

This approach allows us to:
- Test the complete UI workflow with functional tools
- Validate the index.json schema with real implementations
- Deploy to GitHub Pages for stakeholder feedback
- Prove the metadata-driven architecture works end-to-end

## Decision
We will create a mock tool bundle consisting of 10-15 JavaScript tools focused on GeoJSON processing and spatial analysis. These tools will:

1. Execute entirely in the browser (client-side)
2. Follow the same metadata structure as planned Python tools
3. Demonstrate realistic input/output workflows
4. Support the complete ToolVault UI feature set

### Tool Categories
- **Geometric Transformations**: Translate, flip, rotate GeoJSON features
- **Temporal Analysis**: Speed and direction calculations from GPS tracks
- **Statistical Analysis**: Speed histograms and averages
- **Data Processing**: Smoothing algorithms for polylines
- **Format Conversion**: REP file import/export, CSV export

## Mock Toolset Specification

| Tool Name | Category | Inputs | Outputs | Parameters |
|-----------|----------|---------|---------|------------|
| **Translate Features** | Transform | GeoJSON FeatureCollection | GeoJSON FeatureCollection | direction (number, degrees), distance (number, meters) |
| **Flip Horizontal** | Transform | GeoJSON FeatureCollection | GeoJSON FeatureCollection | axis (string, "longitude\|latitude") |
| **Flip Vertical** | Transform | GeoJSON FeatureCollection | GeoJSON FeatureCollection | axis (string, "longitude\|latitude") |
| **Calculate Speed Series** | Analysis | GeoJSON LineString with timestamps | JSON time series | time_unit (string, "seconds\|minutes\|hours") |
| **Calculate Direction Series** | Analysis | GeoJSON LineString with timestamps | JSON time series | smoothing (boolean), window_size (number) |
| **Average Speed** | Statistics | GeoJSON LineString with timestamps | Number | time_unit (string, "seconds\|minutes\|hours") |
| **Speed Histogram** | Statistics | GeoJSON LineString with timestamps | JSON histogram | interval_minutes (number, default: 1), bins (number, default: 20) |
| **Smooth Polyline** | Processing | GeoJSON LineString | GeoJSON LineString | algorithm (string, "moving_average\|gaussian"), window_size (number) |
| **Import REP File** | Import | File (REP format) | GeoJSON FeatureCollection | encoding (string, default: "utf-8") |
| **Export to REP** | Export | GeoJSON FeatureCollection | File (REP format) | precision (number, default: 6) |
| **Export to CSV** | Export | GeoJSON FeatureCollection | File (CSV format) | include_properties (boolean, default: true), coordinate_format (string, "separate\|wkt") |

### Technical Implementation Details

**Execution Environment**: Browser JavaScript (ES2020+)
- No external dependencies beyond standard Web APIs
- Use Canvas API for geometric calculations
- LocalStorage for temporary file handling
- Web Workers for heavy computation (if needed)

**Input/Output Types**:
- `GeoJSON`: Standard GeoJSON objects (FeatureCollection, Feature, LineString)
- `File`: Browser File objects with specified formats (REP, CSV)
- `JSON`: Structured data objects (time series, histograms)
- `Number`: Numeric values with units specified in metadata

**Bundle Structure**:
```
/tools/
  index.json                 # Tool registry and metadata
  /transform/
    translate.js
    flip.js
  /analysis/
    speed-series.js
    direction-series.js
  /statistics/
    average-speed.js
    speed-histogram.js
  /processing/
    smooth-polyline.js
  /io/
    import-rep.js
    export-rep.js
    export-csv.js
/examples/
  sample-track.geojson       # GPS track for testing
  sample-features.geojson    # Mixed feature collection
/schemas/
  rep-format.md             # REP file format specification
```

## Consequences

### Positive
- Rapid prototyping and iteration on UI components
- Real functional testing of metadata-driven architecture
- Early stakeholder feedback on user experience
- Validation of index.json schema design
- GitHub Pages deployment enables easy sharing
- JavaScript tools can be reused or referenced in future implementations

### Negative
- JavaScript tools may not reflect final Python tool capabilities
- Additional maintenance burden for mock implementations
- Risk of UI becoming too coupled to JavaScript-specific patterns
- Mock data may not represent real-world tool complexity

### Risks
- Stakeholders may expect JavaScript tools in production
- Mock tools may oversimplify real computational requirements
- UI optimizations for JavaScript execution may not transfer to Python backend

## Implementation Plan
1. Create index.json schema with tool metadata
2. Implement 3-4 core tools for initial UI testing
3. Expand to full 10-15 tool set iteratively
4. Deploy to GitHub Pages for feedback collection
5. Document lessons learned for Python backend implementation