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
} from '@mui/icons-material';
import { getInputType, getInputPlaceholder } from '../../utils/inputValidation';
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
    case 'geojson':
      return <DataObject />;
    case 'map':
    case 'geojson':
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
  const handleInputChange = (name: string, value: any) => {
    if (!onChange) return;
    
    onChange({
      ...values,
      [name]: value,
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
          const isMultiline = inputType === 'textarea';
          const hasError = errors[input.name];
          
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
                    </Box>
                  }
                  secondary={input.label !== input.name ? `Parameter: ${input.name}` : undefined}
                />
              </Box>
              
              {!readOnly && (
                <Box sx={{ width: '100%', ml: 5 }}>
                  <TextField
                    fullWidth
                    name={input.name}
                    type={isMultiline ? 'text' : inputType}
                    multiline={isMultiline}
                    rows={isMultiline ? 4 : 1}
                    value={values[input.name] || ''}
                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                    placeholder={getInputPlaceholder(input)}
                    error={!!hasError}
                    variant="outlined"
                    size="small"
                  />
                  {hasError && (
                    <FormHelperText error>
                      {errors[input.name]}
                    </FormHelperText>
                  )}
                </Box>
              )}
              
              {readOnly && values[input.name] && (
                <Box sx={{ width: '100%', ml: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {values[input.name]}
                  </Typography>
                </Box>
              )}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}