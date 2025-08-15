import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  Divider,
} from '@mui/material';
import {
  Compare,
  TrendingUp,
  TrendingDown,
  Remove,
  Visibility,
  Analytics,
  Download,
  Share,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts';
import type { ExecutionState, ExecutionResults } from '../../types/execution';

export interface ExecutionComparisonProps {
  executions: ExecutionState[];
  onRemoveExecution?: (executionId: string) => void;
  onViewExecution?: (executionId: string) => void;
}

interface ComparisonMetrics {
  performance: {
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    durationVariation: number;
  };
  success: {
    successRate: number;
    totalExecutions: number;
    failedExecutions: number;
  };
  resources: {
    averageMemoryUsage: number;
    averageCpuUsage: number;
    averageNetworkLatency: number;
  };
}

interface ExecutionDifference {
  executionId: string;
  metrics: {
    duration: {
      value: number;
      percentageDifference: number;
      trend: 'up' | 'down' | 'neutral';
    };
    success: boolean;
    memoryUsage?: {
      value: number;
      percentageDifference: number;
      trend: 'up' | 'down' | 'neutral';
    };
    cpuUsage?: {
      value: number;
      percentageDifference: number;
      trend: 'up' | 'down' | 'neutral';
    };
  };
}

export function ExecutionComparison({
  executions,
  onRemoveExecution,
  onViewExecution
}: ExecutionComparisonProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<ExecutionState | null>(null);

  // Calculate comparison metrics
  const comparisonMetrics = useMemo((): ComparisonMetrics => {
    if (executions.length === 0) {
      return {
        performance: { averageDuration: 0, minDuration: 0, maxDuration: 0, durationVariation: 0 },
        success: { successRate: 0, totalExecutions: 0, failedExecutions: 0 },
        resources: { averageMemoryUsage: 0, averageCpuUsage: 0, averageNetworkLatency: 0 },
      };
    }

    const durations = executions
      .filter(e => e.duration !== undefined)
      .map(e => e.duration!);

    const successfulExecutions = executions.filter(e => e.status === 'completed').length;
    
    const memoryUsages = executions
      .map(e => e.metadata?.performanceMetrics?.memoryUsage)
      .filter(Boolean) as number[];
    
    const cpuUsages = executions
      .map(e => e.metadata?.performanceMetrics?.cpuUsage)
      .filter(Boolean) as number[];
    
    const networkLatencies = executions
      .map(e => e.metadata?.performanceMetrics?.networkLatency)
      .filter(Boolean) as number[];

    const avgDuration = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
    
    // Calculate variation as coefficient of variation
    const durationStdDev = durations.length > 1 
      ? Math.sqrt(durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / (durations.length - 1))
      : 0;
    const durationVariation = avgDuration > 0 ? (durationStdDev / avgDuration) * 100 : 0;

    return {
      performance: {
        averageDuration: avgDuration,
        minDuration,
        maxDuration,
        durationVariation,
      },
      success: {
        successRate: executions.length > 0 ? successfulExecutions / executions.length : 0,
        totalExecutions: executions.length,
        failedExecutions: executions.length - successfulExecutions,
      },
      resources: {
        averageMemoryUsage: memoryUsages.length > 0 ? memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length : 0,
        averageCpuUsage: cpuUsages.length > 0 ? cpuUsages.reduce((sum, c) => sum + c, 0) / cpuUsages.length : 0,
        averageNetworkLatency: networkLatencies.length > 0 ? networkLatencies.reduce((sum, n) => sum + n, 0) / networkLatencies.length : 0,
      },
    };
  }, [executions]);

  // Calculate individual execution differences from average
  const executionDifferences = useMemo((): ExecutionDifference[] => {
    return executions.map(execution => {
      const duration = execution.duration || 0;
      const durationDiff = comparisonMetrics.performance.averageDuration > 0
        ? ((duration - comparisonMetrics.performance.averageDuration) / comparisonMetrics.performance.averageDuration) * 100
        : 0;

      const memoryUsage = execution.metadata?.performanceMetrics?.memoryUsage;
      const memoryDiff = memoryUsage && comparisonMetrics.resources.averageMemoryUsage > 0
        ? ((memoryUsage - comparisonMetrics.resources.averageMemoryUsage) / comparisonMetrics.resources.averageMemoryUsage) * 100
        : 0;

      const cpuUsage = execution.metadata?.performanceMetrics?.cpuUsage;
      const cpuDiff = cpuUsage && comparisonMetrics.resources.averageCpuUsage > 0
        ? ((cpuUsage - comparisonMetrics.resources.averageCpuUsage) / comparisonMetrics.resources.averageCpuUsage) * 100
        : 0;

      return {
        executionId: execution.id,
        metrics: {
          duration: {
            value: duration,
            percentageDifference: durationDiff,
            trend: Math.abs(durationDiff) < 5 ? 'neutral' : durationDiff > 0 ? 'up' : 'down',
          },
          success: execution.status === 'completed',
          memoryUsage: memoryUsage ? {
            value: memoryUsage,
            percentageDifference: memoryDiff,
            trend: Math.abs(memoryDiff) < 5 ? 'neutral' : memoryDiff > 0 ? 'up' : 'down',
          } : undefined,
          cpuUsage: cpuUsage ? {
            value: cpuUsage,
            percentageDifference: cpuDiff,
            trend: Math.abs(cpuDiff) < 5 ? 'neutral' : cpuDiff > 0 ? 'up' : 'down',
          } : undefined,
        },
      };
    });
  }, [executions, comparisonMetrics]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return executions.map((execution, index) => ({
      name: `Execution ${index + 1}`,
      executionId: execution.id,
      duration: execution.duration || 0,
      memoryUsage: execution.metadata?.performanceMetrics?.memoryUsage || 0,
      cpuUsage: execution.metadata?.performanceMetrics?.cpuUsage || 0,
      status: execution.status === 'completed' ? 1 : 0,
      startTime: execution.startTime.getTime(),
    }));
  }, [executions]);

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatPercentage = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <TrendingUp color="error" />;
      case 'down': return <TrendingDown color="success" />;
      default: return <Remove color="disabled" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral', isGoodWhenLow = true) => {
    if (trend === 'neutral') return 'default';
    if (isGoodWhenLow) {
      return trend === 'down' ? 'success' : 'error';
    } else {
      return trend === 'up' ? 'success' : 'error';
    }
  };

  const exportComparison = () => {
    const data = {
      executions: executions.map(e => ({
        id: e.id,
        toolId: e.toolId,
        status: e.status,
        duration: e.duration,
        startTime: e.startTime,
        endTime: e.endTime,
      })),
      metrics: comparisonMetrics,
      differences: executionDifferences,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `execution_comparison_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (executions.length < 2) {
    return (
      <Card>
        <CardHeader title="Execution Comparison" />
        <CardContent>
          <Alert severity="info">
            Select at least 2 executions to compare performance and results.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Execution Comparison"
        subheader={`Comparing ${executions.length} executions`}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Export Comparison">
              <IconButton onClick={exportComparison}>
                <Download />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      
      <CardContent>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Performance Charts" />
          <Tab label="Detailed Comparison" />
        </Tabs>

        {/* Overview Tab */}
        {selectedTab === 0 && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              {/* Performance Summary */}
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Average Duration:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatDuration(comparisonMetrics.performance.averageDuration)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Fastest:</Typography>
                        <Typography variant="body2" color="success.main">
                          {formatDuration(comparisonMetrics.performance.minDuration)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Slowest:</Typography>
                        <Typography variant="body2" color="error.main">
                          {formatDuration(comparisonMetrics.performance.maxDuration)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Variation:</Typography>
                        <Typography variant="body2">
                          {comparisonMetrics.performance.durationVariation.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Success Rate */}
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Success Rate
                    </Typography>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Typography variant="h3" color="primary">
                        {(comparisonMetrics.success.successRate * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Chip 
                        label={`${comparisonMetrics.success.totalExecutions - comparisonMetrics.success.failedExecutions} Successful`}
                        color="success"
                        size="small"
                      />
                      <Chip 
                        label={`${comparisonMetrics.success.failedExecutions} Failed`}
                        color="error"
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Resource Usage */}
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Average Resources
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Memory:</Typography>
                        <Typography variant="body2">
                          {comparisonMetrics.resources.averageMemoryUsage.toFixed(1)} MB
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">CPU:</Typography>
                        <Typography variant="body2">
                          {comparisonMetrics.resources.averageCpuUsage.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Network:</Typography>
                        <Typography variant="body2">
                          {comparisonMetrics.resources.averageNetworkLatency.toFixed(0)}ms
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Performance Charts Tab */}
        {selectedTab === 1 && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Execution Duration
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="duration" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Resource Usage Over Time
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="memoryUsage" stroke="#8884d8" name="Memory (MB)" />
                        <Line type="monotone" dataKey="cpuUsage" stroke="#82ca9d" name="CPU (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Detailed Comparison Tab */}
        {selectedTab === 2 && (
          <Box sx={{ mt: 3 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Execution</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Duration</TableCell>
                    <TableCell align="right">vs Average</TableCell>
                    <TableCell align="right">Memory (MB)</TableCell>
                    <TableCell align="right">CPU (%)</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {executions.map((execution, index) => {
                    const diff = executionDifferences.find(d => d.executionId === execution.id);
                    if (!diff) return null;

                    return (
                      <TableRow key={execution.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            Execution {index + 1}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {execution.id.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={execution.status}
                            color={execution.status === 'completed' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        
                        <TableCell align="right">
                          {formatDuration(diff.metrics.duration.value)}
                        </TableCell>
                        
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            {getTrendIcon(diff.metrics.duration.trend)}
                            <Typography 
                              variant="body2"
                              color={getTrendColor(diff.metrics.duration.trend)}
                            >
                              {formatPercentage(diff.metrics.duration.percentageDifference)}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell align="right">
                          {diff.metrics.memoryUsage ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Typography variant="body2">
                                {diff.metrics.memoryUsage.value.toFixed(1)}
                              </Typography>
                              {getTrendIcon(diff.metrics.memoryUsage.trend)}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        
                        <TableCell align="right">
                          {diff.metrics.cpuUsage ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Typography variant="body2">
                                {diff.metrics.cpuUsage.value.toFixed(1)}
                              </Typography>
                              {getTrendIcon(diff.metrics.cpuUsage.trend)}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {onViewExecution && (
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => onViewExecution(execution.id)}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                            )}
                            {onRemoveExecution && (
                              <Tooltip title="Remove from Comparison">
                                <IconButton
                                  size="small"
                                  onClick={() => onRemoveExecution(execution.id)}
                                  color="error"
                                >
                                  <Remove />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default ExecutionComparison;