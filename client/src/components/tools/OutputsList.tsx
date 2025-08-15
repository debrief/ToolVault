import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
} from '@mui/material';
import {
  TextFields,
  Numbers,
  Map,
  DataObject,
  Image,
  TableChart,
  BarChart,
  Description,
} from '@mui/icons-material';
import type { ToolOutput } from '../../types/index';

interface OutputsListProps {
  outputs: ToolOutput[];
  showPreview?: boolean;
  previewData?: Record<string, any>;
}

function getOutputIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'number':
      return <Numbers />;
    case 'json':
    case 'geojson':
      return <DataObject />;
    case 'map':
    case 'geojson':
      return <Map />;
    case 'image':
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <Image />;
    case 'table':
    case 'csv':
      return <TableChart />;
    case 'chart':
    case 'graph':
      return <BarChart />;
    case 'html':
    case 'markdown':
      return <Description />;
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
    case 'json':
    case 'geojson':
      return 'warning';
    case 'map':
      return 'success';
    case 'image':
      return 'secondary';
    case 'table':
    case 'csv':
      return 'info';
    default:
      return 'default';
  }
}

function OutputPreview({ output, data }: { output: ToolOutput; data?: any }) {
  if (!data) {
    return (
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          mt: 1, 
          backgroundColor: 'grey.50',
          minHeight: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {output.type.toLowerCase() === 'map' || output.type.toLowerCase() === 'geojson' 
            ? 'Map will be rendered here' 
            : 'Output will appear here after execution'}
        </Typography>
      </Paper>
    );
  }

  // Handle different output types
  switch (output.type.toLowerCase()) {
    case 'map':
    case 'geojson':
      return (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mt: 1, 
            backgroundColor: 'success.50',
            minHeight: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" color="success.main">
            🗺️ Interactive Map Display
          </Typography>
        </Paper>
      );
    
    case 'image':
      return (
        <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
          <img 
            src={data} 
            alt={output.label || output.name}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </Paper>
      );
    
    case 'json':
      return (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mt: 1, 
            backgroundColor: 'grey.50',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            overflow: 'auto',
            maxHeight: 200,
          }}
        >
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </Paper>
      );
    
    default:
      return (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mt: 1, 
            backgroundColor: 'grey.50',
            overflow: 'auto',
            maxHeight: 200,
          }}
        >
          <Typography variant="body2">
            {typeof data === 'string' ? data : JSON.stringify(data)}
          </Typography>
        </Paper>
      );
  }
}

export function OutputsList({ outputs, showPreview = false, previewData = {} }: OutputsListProps) {
  if (outputs.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No outputs defined
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ px: 2, pt: 2 }}>
        Expected Outputs
      </Typography>
      
      <List disablePadding>
        {outputs.map((output) => (
          <ListItem key={output.name} sx={{ flexDirection: 'column', alignItems: 'stretch', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: '100%' }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getOutputIcon(output.type)}
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {output.label || output.name}
                    </Typography>
                    <Chip 
                      label={output.type} 
                      size="small" 
                      color={getTypeColor(output.type)}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={output.label !== output.name ? `Output: ${output.name}` : undefined}
              />
            </Box>
            
            {showPreview && (
              <Box sx={{ width: '100%', ml: 5 }}>
                <OutputPreview 
                  output={output} 
                  data={previewData[output.name]}
                />
              </Box>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}