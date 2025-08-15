/**
 * TypeScript types and interfaces for the output rendering system
 */

import type { ChartData, ChartOptions } from 'chart.js';
import type { GeoJSON } from 'geojson';
import type { GridColDef } from '@mui/x-data-grid';

// Core output types supported by the system
export type OutputType = 
  | 'geojson'
  | 'table' 
  | 'chart'
  | 'image'
  | 'text'
  | 'json'
  | 'html'
  | 'generic';

// Chart types supported by Chart.js
export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'doughnut';

// Export formats for different output types
export type ExportFormat = 'csv' | 'json' | 'excel' | 'png' | 'svg' | 'geojson' | 'kml';

// Output metadata for enhanced rendering and type detection
export interface OutputMetadata {
  type?: OutputType;
  chartType?: ChartType;
  language?: string;
  encoding?: string;
  mimeType?: string;
  size?: number;
  dimensions?: {
    width?: number;
    height?: number;
  };
  [key: string]: any;
}

// Base interface for all output renderers
export interface BaseOutputProps {
  data: any;
  metadata?: OutputMetadata;
  title?: string;
  height?: number;
  width?: string;
  interactive?: boolean;
  exportable?: boolean;
}

// MapViewer specific props
export interface MapViewerProps extends BaseOutputProps {
  data: GeoJSON.FeatureCollection;
  showControls?: boolean;
  center?: [number, number];
  zoom?: number;
}

// TableViewer specific props
export interface TableViewerProps extends BaseOutputProps {
  data: any[];
  columns?: GridColDef[];
  searchable?: boolean;
  selectable?: boolean;
  pageSize?: number;
}

// ChartViewer specific props
export interface ChartViewerProps extends BaseOutputProps {
  data: ChartData;
  type: ChartType;
  options?: ChartOptions;
  downloadable?: boolean;
}

// ImageViewer specific props
export interface ImageViewerProps extends BaseOutputProps {
  src: string;
  alt?: string;
  maxHeight?: number;
  zoomable?: boolean;
  galleryMode?: boolean;
}

// TextViewer specific props
export interface TextViewerProps extends BaseOutputProps {
  content: string;
  language?: string;
  searchable?: boolean;
  lineNumbers?: boolean;
  maxHeight?: number;
}

// JsonViewer specific props
export interface JsonViewerProps extends BaseOutputProps {
  data: any;
  expandable?: boolean;
  maxHeight?: number;
  searchable?: boolean;
  theme?: 'light' | 'dark';
}

// Universal OutputRenderer props
export interface OutputRendererProps extends BaseOutputProps {
  data: any;
  metadata?: OutputMetadata;
  title?: string;
  height?: number;
  interactive?: boolean;
  showTypeIndicator?: boolean;
}

// Export configuration
export interface ExportConfig {
  format: ExportFormat;
  filename?: string;
  options?: {
    includeHeaders?: boolean;
    separator?: string;
    imageQuality?: number;
    compression?: boolean;
  };
}

// Virtualization props for large datasets
export interface VirtualizedOutputProps {
  data: any[];
  itemHeight?: number;
  overscan?: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  height?: number;
}

// Feature detection interfaces
export interface FeatureDetectionResult {
  type: OutputType;
  confidence: number;
  metadata?: OutputMetadata;
}

// GeoJSON feature properties for popup rendering
export interface GeoJSONFeatureProps {
  [key: string]: any;
}

// Chart data transformation utilities
export interface ChartDataTransform {
  labels?: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// Performance optimization interfaces
export interface PerformanceConfig {
  enableVirtualization?: boolean;
  lazyLoading?: boolean;
  chunkSize?: number;
  maxRenderItems?: number;
}

// Error handling for output rendering
export interface OutputError {
  type: 'parse' | 'render' | 'export' | 'network';
  message: string;
  details?: any;
  recoverable?: boolean;
}

// Loading states for async operations
export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

// Search functionality
export interface SearchConfig {
  enabled: boolean;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
}

// Accessibility configuration
export interface A11yConfig {
  announceChanges?: boolean;
  keyboardNavigation?: boolean;
  highContrast?: boolean;
  reducedMotion?: boolean;
}