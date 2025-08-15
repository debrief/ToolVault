import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  RadioButtonUnchecked,
  Schedule,
  Speed,
  Memory,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { ExecutionState, ExecutionProgress as ExecutionProgressType } from '../../types/execution';

const ExpandMoreIcon = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded: boolean }>(({ theme, expanded }) => ({
  transform: !expanded ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export interface ExecutionProgressProps {
  execution: ExecutionState;
  progress?: ExecutionProgressType | null;
  showDetails?: boolean;
  onToggleDetails?: () => void;
  sx?: any;
}

export function ExecutionProgress({
  execution,
  progress,
  showDetails = false,
  onToggleDetails,
  sx
}: ExecutionProgressProps) {
  const [expanded, setExpanded] = React.useState(showDetails);

  const handleExpandClick = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggleDetails?.();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTimeRemaining = (ms?: number) => {
    if (!ms) return 'Unknown';
    return formatDuration(ms);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'running':
        return <Schedule color="primary" />;
      case 'failed':
        return <CheckCircle color="error" />;
      case 'cancelled':
        return <RadioButtonUnchecked color="warning" />;
      default:
        return <RadioButtonUnchecked color="disabled" />;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'primary';
    }
  };

  const currentProgress = progress?.progress ?? execution.progress ?? 0;
  const currentDuration = execution.endTime 
    ? execution.endTime.getTime() - execution.startTime.getTime()
    : Date.now() - execution.startTime.getTime();

  return (
    <Card sx={{ ...sx }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getStatusIcon(execution.status)}
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography variant="subtitle1" component="div">
              Execution Status: {execution.status}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress?.progressMessage || 'Processing...'}
            </Typography>
          </Box>
          <ExpandMoreIcon
            expanded={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMore />
          </ExpandMoreIcon>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress: {Math.round(currentProgress)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Duration: {formatDuration(currentDuration)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={currentProgress}
            color={getProgressColor(execution.status) as any}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Quick Stats */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<Speed />}
            label={`Duration: ${formatDuration(currentDuration)}`}
            variant="outlined"
            size="small"
          />
          {progress?.estimatedTimeRemaining && (
            <Chip
              icon={<Schedule />}
              label={`ETA: ${formatTimeRemaining(progress.estimatedTimeRemaining)}`}
              variant="outlined"
              size="small"
            />
          )}
          {execution.metadata?.performanceMetrics && (
            <Chip
              icon={<Memory />}
              label={`Memory: ${execution.metadata.performanceMetrics.memoryUsage}MB`}
              variant="outlined"
              size="small"
            />
          )}
        </Box>

        {/* Detailed Information */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Execution Details
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Execution ID"
                  secondary={execution.id}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Schedule />
                </ListItemIcon>
                <ListItemText
                  primary="Started"
                  secondary={execution.startTime.toLocaleString()}
                />
              </ListItem>
              
              {execution.endTime && (
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle />
                  </ListItemIcon>
                  <ListItemText
                    primary="Completed"
                    secondary={execution.endTime.toLocaleString()}
                  />
                </ListItem>
              )}

              <ListItem>
                <ListItemIcon>
                  <Speed />
                </ListItemIcon>
                <ListItemText
                  primary="Tool ID"
                  secondary={execution.toolId}
                />
              </ListItem>

              {execution.metadata && Object.keys(execution.metadata).length > 0 && (
                <ListItem>
                  <ListItemIcon>
                    <Memory />
                  </ListItemIcon>
                  <ListItemText
                    primary="Metadata"
                    secondary={JSON.stringify(execution.metadata, null, 2)}
                    secondaryTypographyProps={{
                      component: 'pre',
                      sx: { 
                        fontSize: '0.75rem',
                        backgroundColor: 'grey.100',
                        p: 1,
                        borderRadius: 1,
                        mt: 1
                      }
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default ExecutionProgress;