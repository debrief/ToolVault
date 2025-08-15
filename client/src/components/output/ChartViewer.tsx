/**
 * ChartViewer component for rendering interactive charts using Chart.js
 */

import React, { useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  ButtonGroup,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterPlot as ScatterPlotIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar, Line, Pie, Scatter, Doughnut } from 'react-chartjs-2';
import type { ChartViewerProps, ChartType } from '../../types/output';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

export const ChartViewer: React.FC<ChartViewerProps> = ({
  data,
  type: initialType,
  title,
  height = 400,
  interactive = true,
  downloadable = true,
  options: customOptions,
}) => {
  const chartRef = useRef<ChartJS>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentChartType, setCurrentChartType] = useState<ChartType>(initialType);
  const [error, setError] = useState<string | null>(null);

  // Validate chart data
  const isValidData = useMemo(() => {
    if (!data || !data.datasets || !Array.isArray(data.datasets)) {
      setError('Invalid chart data: missing datasets');
      return false;
    }

    const hasValidDatasets = data.datasets.every(dataset =>
      dataset.data && Array.isArray(dataset.data) && dataset.data.length > 0
    );

    if (!hasValidDatasets) {
      setError('Invalid chart data: datasets must contain data arrays');
      return false;
    }

    setError(null);
    return true;
  }, [data]);

  // Chart configuration options
  const chartOptions = useMemo((): ChartOptions => {
    const baseOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        enabled: interactive,
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        title: {
          display: !!title,
          text: title,
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        tooltip: {
          enabled: interactive,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y ?? context.parsed;
              return `${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`;
            },
          },
        },
      },
      animation: {
        duration: 750,
        easing: 'easeOutQuart',
      },
    };

    // Chart type specific options
    if (currentChartType !== 'pie' && currentChartType !== 'doughnut') {
      baseOptions.scales = {
        x: {
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            maxRotation: 45,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            callback: function(value) {
              return typeof value === 'number' ? value.toLocaleString() : value;
            },
          },
        },
      };
    }

    // Merge with custom options
    return { ...baseOptions, ...customOptions };
  }, [title, interactive, currentChartType, customOptions]);

  // Render the appropriate chart component
  const renderChart = useCallback((isFullscreenMode = false) => {
    if (!isValidData) return null;

    const chartProps = {
      ref: chartRef,
      data,
      options: {
        ...chartOptions,
        maintainAspectRatio: false,
      },
      height: isFullscreenMode ? undefined : height,
    };

    switch (currentChartType) {
      case 'bar':
        return <Bar {...chartProps} />;
      case 'line':
        return <Line {...chartProps} />;
      case 'pie':
        return <Pie {...chartProps} />;
      case 'scatter':
        return <Scatter {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      default:
        return <Bar {...chartProps} />;
    }
  }, [data, chartOptions, currentChartType, height, isValidData]);

  // Handle chart download
  const handleDownload = useCallback((format: 'png' | 'jpg' = 'png') => {
    if (!downloadable || !chartRef.current) return;

    try {
      const canvas = chartRef.current.canvas;
      const url = canvas.toDataURL(`image/${format}`, 0.9);
      const link = document.createElement('a');
      link.download = `${title || 'chart'}.${format}`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error('Error downloading chart:', error);
    }
  }, [downloadable, title]);

  // Chart type icons
  const getChartTypeIcon = (type: ChartType) => {
    switch (type) {
      case 'bar':
        return <BarChartIcon />;
      case 'line':
        return <LineChartIcon />;
      case 'pie':
      case 'doughnut':
        return <PieChartIcon />;
      case 'scatter':
        return <ScatterPlotIcon />;
      default:
        return <BarChartIcon />;
    }
  };

  // Available chart types based on data structure
  const availableChartTypes = useMemo((): ChartType[] => {
    if (!isValidData) return [initialType];

    // Basic types always available
    const types: ChartType[] = ['bar', 'line'];

    // Pie charts for single dataset with labels
    if (data.datasets.length === 1 && data.labels) {
      types.push('pie', 'doughnut');
    }

    // Scatter for datasets with x,y coordinates
    const hasScatterData = data.datasets.some(dataset =>
      dataset.data.some((point: any) => 
        typeof point === 'object' && 'x' in point && 'y' in point
      )
    );

    if (hasScatterData) {
      types.push('scatter');
    }

    return types;
  }, [data, initialType, isValidData]);

  if (error) {
    return (
      <Box sx={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Chart Rendering Error
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height, width: '100%', position: 'relative' }}>
      {/* Chart Controls */}
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 1,
        display: 'flex',
        gap: 1,
        p: 0.5
      }}>
        {/* Chart Type Selector */}
        {availableChartTypes.length > 1 && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={currentChartType}
              label="Type"
              onChange={(e) => setCurrentChartType(e.target.value as ChartType)}
            >
              {availableChartTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getChartTypeIcon(type)}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <ButtonGroup size="small" variant="outlined">
          {downloadable && (
            <Tooltip title="Download as PNG">
              <Button onClick={() => handleDownload('png')}>
                <DownloadIcon />
              </Button>
            </Tooltip>
          )}
          
          <Tooltip title="Fullscreen view">
            <Button onClick={() => setIsFullscreen(true)}>
              <FullscreenIcon />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Box>

      {/* Chart Content */}
      <Box sx={{ height: '100%', width: '100%', pt: 1 }}>
        {renderChart()}
      </Box>

      {/* Chart Statistics */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 10, 
        left: 10, 
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 1,
        padding: 1
      }}>
        <Typography variant="caption" color="text.secondary">
          Datasets: {data.datasets?.length || 0} | 
          Points: {data.datasets?.[0]?.data?.length || 0}
        </Typography>
      </Box>

      {/* Fullscreen Modal */}
      <Dialog
        open={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Box>
            <Typography variant="h6">
              {title || 'Chart Viewer'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentChartType.charAt(0).toUpperCase() + currentChartType.slice(1)} Chart
            </Typography>
          </Box>
          <IconButton onClick={() => setIsFullscreen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 1, overflow: 'hidden', height: '100%' }}>
          <Box sx={{ height: '100%', width: '100%' }}>
            {renderChart(true)}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ChartViewer;