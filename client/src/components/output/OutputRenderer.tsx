/**
 * Universal OutputRenderer component that intelligently routes to appropriate viewers
 */

import React, { lazy, Suspense, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Tooltip,
  IconButton,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Info as InfoIcon,
  SwapVert as SwapIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { detectOutputType } from '../../utils/outputTypeDetection';
import type { OutputRendererProps, OutputType, ChartData } from '../../types/output';

/**
 * Normalize GeoJSON data for MapViewer consumption
 * Handles single Features, nested objects with features, and FeatureCollections
 */
function normalizeGeoJSONData(data: any): any {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // If it's already a FeatureCollection, return as-is
  if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
    return data;
  }

  // If it's a single Feature, wrap it in a FeatureCollection
  if (data.type === 'Feature' && data.geometry) {
    return {
      type: 'FeatureCollection',
      features: [data]
    };
  }

  // Check if the data has a nested feature property (common for tool outputs)
  if (data.feature && typeof data.feature === 'object') {
    if (data.feature.type === 'Feature' && data.feature.geometry) {
      return {
        type: 'FeatureCollection',
        features: [data.feature]
      };
    }
  }

  // Check if the data has a buffered_geometry property (geo-buffer tool)
  if (data.buffered_geometry && typeof data.buffered_geometry === 'object') {
    if (data.buffered_geometry.type === 'Feature' && data.buffered_geometry.geometry) {
      return {
        type: 'FeatureCollection',
        features: [data.buffered_geometry]
      };
    }
  }

  // Try to find any GeoJSON-like structure in the object values
  for (const value of Object.values(data)) {
    if (value && typeof value === 'object') {
      if ((value as any).type === 'Feature' && (value as any).geometry) {
        return {
          type: 'FeatureCollection',
          features: [value]
        };
      }
      if ((value as any).type === 'FeatureCollection' && Array.isArray((value as any).features)) {
        return value;
      }
    }
  }

  // If no valid GeoJSON found, return null to trigger error handling
  return null;
}

// Lazy load all viewer components for better performance
const MapViewer = lazy(() => import('./MapViewer'));
const TableViewer = lazy(() => import('./TableViewer'));
const ChartViewer = lazy(() => import('./ChartViewer'));
const ImageViewer = lazy(() => import('./ImageViewer'));
const TextViewer = lazy(() => import('./TextViewer'));
const JsonViewer = lazy(() => import('./JsonViewer'));
const HtmlViewer = lazy(() => import('./HtmlViewer'));

// Generic fallback viewer for unsupported types
const GenericViewer: React.FC<{ data: any; maxHeight?: number }> = ({ 
  data, 
  maxHeight = 400 
}) => {
  const stringifiedData = useMemo(() => {
    try {
      if (typeof data === 'string') return data;
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }, [data]);

  return (
    <Box sx={{ 
      maxHeight, 
      overflow: 'auto', 
      p: 2, 
      backgroundColor: '#f5f5f5',
      fontFamily: 'monospace',
      fontSize: '14px',
      whiteSpace: 'pre-wrap'
    }}>
      {stringifiedData}
    </Box>
  );
};

// Loading skeleton for async components
const OutputSkeleton: React.FC<{ height?: number }> = ({ height = 400 }) => (
  <Box sx={{ 
    height, 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 2
  }}>
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Loading output renderer...
    </Typography>
  </Box>
);

// Transform data for chart rendering
const transformToChartData = (data: any, metadata?: any): ChartData => {
  // If already in Chart.js format, return as is
  if (data.datasets && Array.isArray(data.datasets)) {
    return data;
  }

  // Transform simple key-value object to chart data
  if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
    const entries = Object.entries(data);
    const labels = entries.map(([key]) => key);
    const values = entries.map(([, value]) => typeof value === 'number' ? value : 0);

    return {
      labels,
      datasets: [{
        label: metadata?.title || 'Data',
        data: values,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      }]
    };
  }

  // Transform array of objects to chart data
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    const keys = Object.keys(data[0]);
    const numericKeys = keys.filter(key => 
      typeof data[0][key] === 'number'
    );

    if (numericKeys.length > 0) {
      const labels = data.map((item, index) => 
        item.name || item.label || item.id || `Item ${index + 1}`
      );

      const datasets = numericKeys.map((key, index) => ({
        label: key,
        data: data.map(item => item[key] || 0),
        backgroundColor: `hsl(${index * 360 / numericKeys.length}, 70%, 60%)`,
        borderColor: `hsl(${index * 360 / numericKeys.length}, 70%, 50%)`,
        borderWidth: 2,
      }));

      return { labels, datasets };
    }
  }

  // Fallback: empty chart data
  return {
    labels: ['No Data'],
    datasets: [{
      label: 'Data',
      data: [0],
      backgroundColor: '#e0e0e0',
    }]
  };
};

export const OutputRenderer: React.FC<OutputRendererProps> = ({
  data,
  metadata,
  title,
  height = 400,
  interactive = true,
  showTypeIndicator = true,
}) => {
  const [manualType, setManualType] = useState<OutputType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Detect output type
  const detectedType = useMemo(() => {
    try {
      return detectOutputType(data, metadata);
    } catch (err) {
      setError(`Type detection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return 'generic';
    }
  }, [data, metadata]);

  // Use manual type if set, otherwise use detected type
  const outputType = manualType || detectedType;

  // Available output types for manual selection
  const availableTypes: OutputType[] = [
    'geojson', 'table', 'chart', 'image', 'text', 'json', 'html', 'generic'
  ];

  // Get type-specific metadata
  const typeMetadata = useMemo(() => {
    const meta: Record<string, any> = { ...metadata };
    
    switch (outputType) {
      case 'geojson':
        if (data?.features) {
          meta.featureCount = data.features.length;
        }
        break;
      case 'table':
        if (Array.isArray(data)) {
          meta.rowCount = data.length;
          meta.columnCount = data.length > 0 ? Object.keys(data[0]).length : 0;
        }
        break;
      case 'chart':
        if (data?.datasets) {
          meta.datasetCount = data.datasets.length;
        }
        break;
      case 'text':
        if (typeof data === 'string') {
          meta.lineCount = data.split('\n').length;
          meta.charCount = data.length;
        }
        break;
      case 'json':
        if (typeof data === 'object') {
          meta.keyCount = Object.keys(data || {}).length;
        }
        break;
      case 'html':
        if (typeof data === 'string') {
          meta.charCount = data.length;
          meta.isValidHtml = /<[^>]*>/.test(data);
        }
        break;
    }
    
    return meta;
  }, [outputType, data, metadata]);

  // Render the appropriate viewer component
  const renderOutput = () => {
    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          <Typography variant="h6" gutterBottom>
            Output Rendering Error
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      );
    }

    const commonProps = {
      height: height - 100, // Account for header
      interactive,
      exportable: true,
    };

    try {
      switch (outputType) {
        case 'geojson':
          const normalizedGeoJSON = normalizeGeoJSONData(data);
          if (!normalizedGeoJSON) {
            throw new Error('Invalid GeoJSON data: Unable to extract valid features');
          }
          return (
            <MapViewer
              data={normalizedGeoJSON}
              {...commonProps}
              showControls={interactive}
            />
          );

        case 'table':
          return (
            <TableViewer
              data={Array.isArray(data) ? data : []}
              {...commonProps}
              searchable={interactive}
              selectable={interactive}
            />
          );

        case 'chart':
          const chartData = transformToChartData(data, typeMetadata);
          return (
            <ChartViewer
              data={chartData}
              type={metadata?.chartType || 'bar'}
              title={title}
              {...commonProps}
              downloadable={interactive}
            />
          );

        case 'image':
          return (
            <ImageViewer
              src={typeof data === 'string' ? data : ''}
              alt={title}
              {...commonProps}
              zoomable={interactive}
            />
          );

        case 'text':
          return (
            <TextViewer
              content={typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
              language={metadata?.language}
              {...commonProps}
              searchable={interactive}
            />
          );

        case 'json':
          return (
            <JsonViewer
              data={data}
              {...commonProps}
              expandable={interactive}
              searchable={interactive}
            />
          );

        case 'html':
          return (
            <HtmlViewer
              data={typeof data === 'string' ? data : JSON.stringify(data)}
              title={title}
              maxHeight={height - 100}
            />
          );

        default:
          return (
            <GenericViewer 
              data={data} 
              maxHeight={commonProps.height}
            />
          );
      }
    } catch (renderError) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          <Typography variant="h6" gutterBottom>
            Rendering Error
          </Typography>
          <Typography variant="body2">
            Failed to render {outputType} output: {renderError instanceof Error ? renderError.message : 'Unknown error'}
          </Typography>
        </Alert>
      );
    }
  };

  // Get type-specific icon and color
  const getTypeInfo = (type: OutputType) => {
    const typeMap = {
      geojson: { label: 'Map', color: 'success' as const, icon: '🗺️' },
      table: { label: 'Table', color: 'info' as const, icon: '📊' },
      chart: { label: 'Chart', color: 'warning' as const, icon: '📈' },
      image: { label: 'Image', color: 'secondary' as const, icon: '🖼️' },
      text: { label: 'Text', color: 'default' as const, icon: '📝' },
      json: { label: 'JSON', color: 'primary' as const, icon: '🔧' },
      generic: { label: 'Generic', color: 'default' as const, icon: '📄' },
    };
    
    return typeMap[type] || typeMap.generic;
  };

  const typeInfo = getTypeInfo(outputType);

  return (
    <Card sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">
              {title || 'Output Viewer'}
            </Typography>
            {showTypeIndicator && (
              <Chip
                size="small"
                label={`${typeInfo.icon} ${typeInfo.label}`}
                color={typeInfo.color}
                variant="outlined"
              />
            )}
          </Box>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Auto-detected: {getTypeInfo(detectedType).label}
            </Typography>
            {manualType && (
              <Chip
                size="small"
                label="Manual Override"
                color="info"
                variant="filled"
              />
            )}
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Manual Type Override */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>View As</InputLabel>
              <Select
                value={manualType || detectedType}
                label="View As"
                onChange={(e) => setManualType(e.target.value as OutputType)}
              >
                {availableTypes.map(type => {
                  const info = getTypeInfo(type);
                  return (
                    <MenuItem key={type} value={type}>
                      {info.icon} {info.label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {/* Info Tooltip */}
            <Tooltip 
              title={
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Output Information
                  </Typography>
                  <Typography variant="caption" display="block">
                    Type: {typeInfo.label}
                  </Typography>
                  {Object.entries(typeMetadata).map(([key, value]) => (
                    <Typography key={key} variant="caption" display="block">
                      {key}: {String(value)}
                    </Typography>
                  ))}
                </Box>
              }
            >
              <IconButton size="small">
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
        sx={{ pb: 1 }}
      />

      {/* Content */}
      <CardContent sx={{ 
        flex: 1, 
        overflow: 'hidden', 
        p: 0,
        '&:last-child': { pb: 0 }
      }}>
        <Suspense fallback={<OutputSkeleton height={height - 100} />}>
          {renderOutput()}
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default OutputRenderer;