import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Alert,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Pause,
  PlayArrow,
  Stop,
  Fullscreen,
  Download,
} from '@mui/icons-material';
import { OutputRenderer } from '../output/OutputRenderer';
import type { ExecutionResults } from '../../types/execution';

export interface StreamingOutputRendererProps {
  executionId: string;
  onComplete?: (results: ExecutionResults) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  enableControls?: boolean;
  sx?: any;
}

interface StreamingState {
  isStreaming: boolean;
  isPaused: boolean;
  progress: number;
  currentData: any;
  error: Error | null;
  bytesReceived: number;
  lastUpdate: Date | null;
}

interface StreamEvent {
  type: 'progress' | 'partial_result' | 'complete' | 'error' | 'metadata';
  data: any;
  timestamp: string;
}

export function StreamingOutputRenderer({
  executionId,
  onComplete,
  onError,
  onProgress,
  enableControls = true,
  sx
}: StreamingOutputRendererProps) {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    isPaused: false,
    progress: 0,
    currentData: null,
    error: null,
    bytesReceived: 0,
    lastUpdate: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);

  // Merge partial data with existing data
  const mergePartialData = (existing: any, partial: any): any => {
    if (!existing) return partial;
    
    // Handle different data types
    if (typeof partial === 'string') {
      return (existing || '') + partial;
    }
    
    if (Array.isArray(partial)) {
      return [...(existing || []), ...partial];
    }
    
    if (typeof partial === 'object' && partial !== null) {
      return { ...existing, ...partial };
    }
    
    return partial;
  };

  // Start streaming connection
  const startStreaming = async () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setState(prev => ({ ...prev, isStreaming: true, error: null }));

    try {
      const eventSource = new EventSource(
        `/api/executions/${executionId}/stream`,
        { withCredentials: true }
      );
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('Streaming connection opened');
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const streamEvent: StreamEvent = JSON.parse(event.data);
          handleStreamEvent(streamEvent);
        } catch (parseError) {
          console.error('Failed to parse stream event:', parseError);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Streaming connection error:', error);
        
        if (eventSource.readyState === EventSource.CLOSED) {
          setState(prev => ({ ...prev, isStreaming: false }));
          
          // Attempt reconnection with exponential backoff
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s, 8s, 16s
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              console.log(`Attempting reconnection ${reconnectAttempts.current}/${maxReconnectAttempts}`);
              startStreaming();
            }, delay);
          } else {
            const connectionError = new Error('Failed to establish streaming connection after multiple attempts');
            setState(prev => ({ ...prev, error: connectionError, isStreaming: false }));
            onError?.(connectionError);
          }
        }
      };

    } catch (error) {
      const streamingError = error as Error;
      setState(prev => ({ ...prev, isStreaming: false, error: streamingError }));
      onError?.(streamingError);
    }
  };

  // Handle different types of stream events
  const handleStreamEvent = (event: StreamEvent) => {
    const now = new Date();
    
    setState(prev => ({
      ...prev,
      lastUpdate: now,
      bytesReceived: prev.bytesReceived + JSON.stringify(event.data).length,
    }));

    switch (event.type) {
      case 'progress':
        const progressValue = event.data.progress || 0;
        setState(prev => ({ ...prev, progress: progressValue }));
        onProgress?.(progressValue);
        break;

      case 'partial_result':
        setState(prev => ({
          ...prev,
          currentData: mergePartialData(prev.currentData, event.data.data),
        }));
        break;

      case 'complete':
        setState(prev => ({
          ...prev,
          currentData: event.data.data,
          isStreaming: false,
          progress: 100,
        }));
        
        // Create ExecutionResults object
        const results: ExecutionResults = {
          executionId,
          toolId: event.data.toolId || 'unknown',
          status: 'completed',
          startTime: new Date(event.data.startTime),
          endTime: new Date(event.data.endTime || Date.now()),
          duration: event.data.duration || 0,
          results: event.data.data,
          metadata: event.data.metadata,
        };
        
        onComplete?.(results);
        break;

      case 'error':
        const streamError = new Error(event.data.message || 'Streaming error occurred');
        setState(prev => ({ 
          ...prev, 
          isStreaming: false, 
          error: streamError 
        }));
        onError?.(streamError);
        break;

      case 'metadata':
        // Handle metadata updates (could update progress indicators, etc.)
        console.log('Received metadata:', event.data);
        break;

      default:
        console.warn('Unknown stream event type:', event.type);
    }
  };

  // Pause/resume streaming (if supported by backend)
  const togglePause = () => {
    if (state.isPaused) {
      startStreaming();
    } else {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    }
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  // Stop streaming
  const stopStreaming = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setState(prev => ({ 
      ...prev, 
      isStreaming: false, 
      isPaused: false 
    }));
  };

  // Download current data
  const downloadCurrentData = () => {
    if (!state.currentData) return;
    
    const dataStr = JSON.stringify(state.currentData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `execution_${executionId}_partial.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format bytes for display
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // Start streaming when component mounts
  useEffect(() => {
    startStreaming();
    
    return () => {
      stopStreaming();
    };
  }, [executionId]);

  return (
    <Box sx={sx}>
      {/* Streaming Status */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1">
                Live Results Stream
              </Typography>
              
              <Chip
                label={state.isStreaming ? 'Streaming' : state.error ? 'Error' : 'Completed'}
                color={state.isStreaming ? 'primary' : state.error ? 'error' : 'success'}
                size="small"
              />
              
              {state.lastUpdate && (
                <Typography variant="caption" color="text.secondary">
                  Last update: {state.lastUpdate.toLocaleTimeString()}
                </Typography>
              )}
            </Box>
            
            {enableControls && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {state.isStreaming && (
                  <Tooltip title={state.isPaused ? 'Resume' : 'Pause'}>
                    <IconButton onClick={togglePause} size="small">
                      {state.isPaused ? <PlayArrow /> : <Pause />}
                    </IconButton>
                  </Tooltip>
                )}
                
                {state.isStreaming && (
                  <Tooltip title="Stop streaming">
                    <IconButton onClick={stopStreaming} size="small" color="error">
                      <Stop />
                    </IconButton>
                  </Tooltip>
                )}
                
                {state.currentData && (
                  <Tooltip title="Download current data">
                    <IconButton onClick={downloadCurrentData} size="small">
                      <Download />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
          </Box>
          
          {/* Progress Bar */}
          {state.isStreaming && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progress: {Math.round(state.progress)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatBytes(state.bytesReceived)} received
                </Typography>
              </Box>
              <LinearProgress
                value={state.progress}
                variant="determinate"
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}
          
          {/* Connection Status */}
          {reconnectAttempts.current > 0 && state.isStreaming && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Reconnection attempt {reconnectAttempts.current}/{maxReconnectAttempts}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Streaming Error</Typography>
          <Typography variant="body2">{state.error.message}</Typography>
          <Button 
            onClick={startStreaming} 
            size="small" 
            sx={{ mt: 1 }}
          >
            Retry Connection
          </Button>
        </Alert>
      )}

      {/* Current Data Display */}
      {state.currentData && (
        <OutputRenderer
          data={state.currentData}
          title="Live Results"
          interactive={!state.isStreaming}
          showMetadata={false}
        />
      )}

      {/* No Data State */}
      {!state.currentData && !state.isStreaming && !state.error && (
        <Alert severity="info">
          <Typography>Waiting for streaming data...</Typography>
        </Alert>
      )}
    </Box>
  );
}

export default StreamingOutputRenderer;