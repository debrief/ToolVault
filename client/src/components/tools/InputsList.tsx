import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  FormHelperText,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  TextFields,
  Numbers,
  Map,
  Email,
  Link,
  DataObject,
  CalendarToday,
  Schedule,
  Code,
  Visibility,
  Edit,
  ToggleOn,
  ToggleOff,
} from '@mui/icons-material';
import { getInputType, getInputPlaceholder } from '../../utils/inputValidation';
import { detectOutputType } from '../../utils/outputTypeDetection';
import { OutputRenderer } from '../output/OutputRenderer';
import type { ToolInput } from '../../types/index';

interface InputsListProps {
  inputs: ToolInput[];
  values?: Record<string, any>;
  onChange?: (values: Record<string, any>) => void;
  readOnly?: boolean;
  errors?: Record<string, string>;
}

function getInputIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'number':
      return <Numbers />;
    case 'email':
      return <Email />;
    case 'url':
      return <Link />;
    case 'json':
      return <DataObject />;
    case 'geojson':
    case 'map':
      return <Map />;
    case 'date':
      return <CalendarToday />;
    case 'time':
    case 'datetime-local':
      return <Schedule />;
    case 'code':
      return <Code />;
    default:
      return <TextFields />;
  }
}

function getTypeColor(type: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  switch (type.toLowerCase()) {
    case 'string':
      return 'primary';
    case 'number':
      return 'info';
    case 'boolean':
      return 'secondary';
    case 'json':
    case 'geojson':
      return 'warning';
    case 'email':
    case 'url':
      return 'success';
    default:
      return 'default';
  }
}

export function InputsList({ 
  inputs, 
  values = {}, 
  onChange, 
  readOnly = false,
  errors = {}
}: InputsListProps) {
  // Track which inputs are in viewer mode vs editor mode
  // Auto-enable viewer mode for GeoJSON inputs with valid data
  const [viewerModes, setViewerModes] = useState<Record<string, boolean>>(() => {
    const initialModes: Record<string, boolean> = {};
    inputs.forEach(input => {
      const value = values[input.name];
      // Auto-enable viewer mode for GeoJSON inputs with data
      if (input.type === 'geojson' && value && typeof value === 'object') {
        const detectedType = detectOutputType(value);
        if (detectedType === 'geojson') {
          initialModes[input.name] = true;
        }
      }
    });
    return initialModes;
  });

  // Update viewer modes when values change (e.g., when test data is loaded)
  React.useEffect(() => {
    inputs.forEach(input => {
      const value = values[input.name];
      // Auto-enable viewer mode for new GeoJSON inputs with data
      if (input.type === 'geojson' && value && typeof value === 'object' && !viewerModes[input.name]) {
        const detectedType = detectOutputType(value);
        if (detectedType === 'geojson') {
          setViewerModes(prev => ({
            ...prev,
            [input.name]: true
          }));
        }
      }
    });
  }, [values, inputs]);

  // Determine if an input should support viewer mode
  const supportsViewerMode = (input: ToolInput, value: any) => {
    if (!value || readOnly) return false;
    
    // Always support viewer mode for complex data types
    const complexTypes = ['json', 'geojson', 'array', 'object'];
    if (complexTypes.includes(input.type)) return true;
    
    // Use intelligent detection for any non-primitive value
    if (typeof value === 'object' && value !== null) {
      const detectedType = detectOutputType(value);
      return ['geojson', 'table', 'chart', 'json'].includes(detectedType);
    }
    
    // Also support viewer mode for long strings that might be structured data
    if (typeof value === 'string' && value.length > 100) {
      const detectedType = detectOutputType(value);
      return ['html', 'text', 'json'].includes(detectedType);
    }
    
    return false;
  };

  // Get the optimal viewer type for an input value
  const getInputViewerType = (input: ToolInput, value: any) => {
    if (!value) return null;
    
    // For GeoJSON inputs, always prefer map viewer
    if (input.type === 'geojson') return 'geojson';
    
    // Use intelligent detection for the actual data
    return detectOutputType(value);
  };

  // Toggle between viewer and editor mode
  const toggleViewerMode = (inputName: string) => {
    setViewerModes(prev => ({
      ...prev,
      [inputName]: !prev[inputName]
    }));
  };
  const handleInputChange = (name: string, value: any, inputType: string) => {
    if (!onChange) return;
    
    let processedValue = value;
    
    // Handle JSON/GeoJSON inputs - parse string back to object
    if ((inputType === 'json' || inputType === 'geojson') && typeof value === 'string') {
      try {
        processedValue = value.trim() ? JSON.parse(value) : null;
      } catch (error) {
        // Keep as string if invalid JSON - validation will catch this
        processedValue = value;
      }
    }
    
    onChange({
      ...values,
      [name]: processedValue,
    });
  };

  if (inputs.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No input parameters required
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ px: 2, pt: 2 }}>
        Input Parameters
      </Typography>
      
      <List disablePadding>
        {inputs.map((input) => {
          const inputType = getInputType(input.type);
          const isMultiline = inputType === 'textarea' || input.type === 'json' || input.type === 'geojson';
          const hasError = errors[input.name];
          
          // Convert object values to JSON string for display
          let displayValue = values[input.name] || '';
          if ((input.type === 'json' || input.type === 'geojson') && typeof displayValue === 'object' && displayValue !== null) {
            displayValue = JSON.stringify(displayValue, null, 2);
          }
          
          return (
            <ListItem key={input.name} sx={{ flexDirection: 'column', alignItems: 'stretch', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: '100%' }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getInputIcon(input.type)}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {input.label || input.name}
                      </Typography>
                      {input.required && (
                        <Chip label="Required" size="small" color="error" variant="outlined" />
                      )}
                      <Chip 
                        label={input.type} 
                        size="small" 
                        color={getTypeColor(input.type)}
                        variant="outlined"
                      />
                      {/* Viewer mode toggle for complex inputs */}
                      {supportsViewerMode(input, values[input.name]) && (
                        <Tooltip title={viewerModes[input.name] ? "Switch to Editor" : "Switch to Viewer"}>
                          <IconButton
                            size="small"
                            onClick={() => toggleViewerMode(input.name)}
                            color={viewerModes[input.name] ? "primary" : "default"}
                          >
                            {viewerModes[input.name] ? <Edit /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  }
                  secondary={input.label !== input.name ? `Parameter: ${input.name}` : undefined}
                />
              </Box>
              
              {!readOnly && (
                <Box sx={{ width: '100%', ml: 5 }}>
                  {/* Show viewer or editor based on mode */}
                  {viewerModes[input.name] && supportsViewerMode(input, values[input.name]) ? (
                    // Viewer Mode - show appropriate viewer
                    <Box sx={{ 
                      border: '1px solid #ddd', 
                      borderRadius: 1, 
                      overflow: 'hidden',
                      backgroundColor: '#fafafa'
                    }}>
                      <OutputRenderer
                        data={values[input.name]}
                        outputs={[]} // No output schema needed for input viewing
                        title={`${input.label || input.name} Preview`}
                        interactive={false} // Read-only viewing
                        compact={true}
                        maxHeight={300}
                      />
                    </Box>
                  ) : (
                    // Editor Mode - show text field
                    <TextField
                      fullWidth
                      name={input.name}
                      type={isMultiline ? 'text' : inputType}
                      multiline={isMultiline}
                      rows={isMultiline ? (input.type === 'json' || input.type === 'geojson') ? 8 : 4 : 1}
                      value={displayValue}
                      onChange={(e) => handleInputChange(input.name, e.target.value, input.type)}
                      placeholder={getInputPlaceholder(input)}
                      error={!!hasError}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiInputBase-input': {
                          fontFamily: (input.type === 'json' || input.type === 'geojson') ? 'monospace' : 'inherit',
                          fontSize: (input.type === 'json' || input.type === 'geojson') ? '0.85rem' : 'inherit'
                        }
                      }}
                    />
                  )}
                  {hasError && (
                    <FormHelperText error>
                      {errors[input.name]}
                    </FormHelperText>
                  )}
                </Box>
              )}
              
              {readOnly && values[input.name] && (
                <Box sx={{ width: '100%', ml: 5 }}>
                  {supportsViewerMode(input, values[input.name]) ? (
                    // Show viewer for complex data in read-only mode
                    <Box sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      overflow: 'hidden',
                      backgroundColor: '#f9f9f9'
                    }}>
                      <OutputRenderer
                        data={values[input.name]}
                        outputs={[]}
                        title={`${input.label || input.name}`}
                        interactive={false}
                        compact={true}
                        maxHeight={250}
                      />
                    </Box>
                  ) : (
                    // Show simple text for primitive data
                    <Typography variant="body2" color="text.secondary">
                      {typeof values[input.name] === 'object' 
                        ? JSON.stringify(values[input.name], null, 2)
                        : String(values[input.name])
                      }
                    </Typography>
                  )}
                </Box>
              )}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}