/**
 * JsonViewer component for displaying JSON data with collapsible tree structure
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  ButtonGroup,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess as CollapseAllIcon,
  ExpandMore as ExpandAllIcon,
} from '@mui/icons-material';
import type { JsonViewerProps } from '../../types/output';

interface JsonNodeProps {
  data: any;
  path: string;
  searchTerm: string;
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
  theme: 'light' | 'dark';
  level: number;
}

const JsonNode: React.FC<JsonNodeProps> = ({
  data,
  path,
  searchTerm,
  expandedPaths,
  onToggleExpand,
  theme,
  level,
}) => {
  const isExpanded = expandedPaths.has(path);
  const indentSize = level * 20;

  const getTypeColor = (value: any) => {
    if (value === null) return theme === 'dark' ? '#f97316' : '#ea580c';
    if (typeof value === 'string') return theme === 'dark' ? '#10b981' : '#059669';
    if (typeof value === 'number') return theme === 'dark' ? '#3b82f6' : '#2563eb';
    if (typeof value === 'boolean') return theme === 'dark' ? '#8b5cf6' : '#7c3aed';
    return theme === 'dark' ? '#ffffff' : '#000000';
  };

  const highlightMatch = (text: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} style={{ backgroundColor: '#ffeb3b', color: 'black', padding: '1px 2px' }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const renderValue = (value: any, key: string = '') => {
    const fullPath = path ? `${path}.${key}` : key;

    if (value === null) {
      return (
        <span style={{ color: getTypeColor(value), fontStyle: 'italic' }}>
          null
        </span>
      );
    }

    if (typeof value === 'string') {
      return (
        <span style={{ color: getTypeColor(value) }}>
          "{highlightMatch(value)}"
        </span>
      );
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return (
        <span style={{ color: getTypeColor(value) }}>
          {highlightMatch(String(value))}
        </span>
      );
    }

    if (Array.isArray(value)) {
      const preview = value.length === 0 ? '[]' : `[${value.length} items]`;
      
      return (
        <Box sx={{ display: 'inline-block' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
               onClick={() => onToggleExpand(fullPath)}>
            <IconButton size="small" sx={{ p: 0, mr: 0.5 }}>
              {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
            <Typography variant="body2" component="span">
              {highlightMatch(preview)}
            </Typography>
          </Box>
          
          <Collapse in={isExpanded}>
            <Box sx={{ ml: 2, mt: 0.5 }}>
              {value.map((item, index) => (
                <Box key={index} sx={{ mb: 0.5 }}>
                  <Typography variant="body2" component="span" sx={{ color: 'text.secondary' }}>
                    [{index}]:
                  </Typography>
                  <Box sx={{ ml: 1, display: 'inline-block' }}>
                    <JsonNode
                      data={item}
                      path={`${fullPath}[${index}]`}
                      searchTerm={searchTerm}
                      expandedPaths={expandedPaths}
                      onToggleExpand={onToggleExpand}
                      theme={theme}
                      level={level + 1}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      const preview = keys.length === 0 ? '{}' : `{${keys.length} properties}`;
      
      return (
        <Box sx={{ display: 'inline-block' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
               onClick={() => onToggleExpand(fullPath)}>
            <IconButton size="small" sx={{ p: 0, mr: 0.5 }}>
              {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
            <Typography variant="body2" component="span">
              {highlightMatch(preview)}
            </Typography>
          </Box>
          
          <Collapse in={isExpanded}>
            <Box sx={{ ml: 2, mt: 0.5 }}>
              {keys.map(objKey => (
                <Box key={objKey} sx={{ mb: 0.5 }}>
                  <Typography variant="body2" component="span" sx={{ color: 'primary.main' }}>
                    "{highlightMatch(objKey)}":
                  </Typography>
                  <Box sx={{ ml: 1, display: 'inline-block' }}>
                    <JsonNode
                      data={value[objKey]}
                      path={`${fullPath}.${objKey}`}
                      searchTerm={searchTerm}
                      expandedPaths={expandedPaths}
                      onToggleExpand={onToggleExpand}
                      theme={theme}
                      level={level + 1}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      );
    }

    return (
      <span style={{ color: getTypeColor(value) }}>
        {highlightMatch(String(value))}
      </span>
    );
  };

  return (
    <Box sx={{ ml: `${indentSize}px` }}>
      {renderValue(data)}
    </Box>
  );
};

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  expandable = true,
  maxHeight = 400,
  searchable = true,
  theme = 'light',
  exportable = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(theme);
  const [showRawJson, setShowRawJson] = useState(false);

  // Validate JSON data
  const isValidData = useMemo(() => {
    try {
      return data !== null && data !== undefined;
    } catch {
      return false;
    }
  }, [data]);

  // Convert data to JSON string for raw view
  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return 'Invalid JSON data';
    }
  }, [data]);

  // Find all matching paths
  const searchMatches = useMemo(() => {
    if (!searchTerm || !searchable) return [];

    const matches: string[] = [];
    const searchLower = searchTerm.toLowerCase();

    const traverse = (obj: any, path: string = '') => {
      if (typeof obj === 'string' && obj.toLowerCase().includes(searchLower)) {
        matches.push(path);
      } else if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            traverse(item, `${path}[${index}]`);
          });
        } else {
          Object.entries(obj).forEach(([key, value]) => {
            const newPath = path ? `${path}.${key}` : key;
            if (key.toLowerCase().includes(searchLower)) {
              matches.push(newPath);
            }
            traverse(value, newPath);
          });
        }
      }
    };

    traverse(data);
    return matches;
  }, [data, searchTerm, searchable]);

  // Toggle expand/collapse for a path
  const handleToggleExpand = useCallback((path: string) => {
    if (!expandable) return;

    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, [expandable]);

  // Expand all nodes
  const handleExpandAll = useCallback(() => {
    if (!expandable) return;

    const allPaths = new Set<string>();
    
    const traverse = (obj: any, path: string = '') => {
      allPaths.add(path);
      
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            traverse(item, `${path}[${index}]`);
          });
        } else {
          Object.entries(obj).forEach(([key, value]) => {
            const newPath = path ? `${path}.${key}` : key;
            traverse(value, newPath);
          });
        }
      }
    };

    traverse(data, 'root');
    setExpandedPaths(allPaths);
  }, [data, expandable]);

  // Collapse all nodes
  const handleCollapseAll = useCallback(() => {
    setExpandedPaths(new Set(['root']));
  }, []);

  // Copy JSON to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
    } catch (error) {
      console.error('Failed to copy JSON:', error);
    }
  }, [jsonString]);

  // Download JSON as file
  const handleDownload = useCallback(() => {
    if (!exportable) return;

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [jsonString, exportable]);

  if (!isValidData) {
    return (
      <Box sx={{ maxHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error">
          <Typography variant="body2">
            Invalid JSON data provided.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxHeight, width: '100%' }}>
      {/* Controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1,
        flexWrap: 'wrap',
        gap: 1
      }}>
        {/* Search */}
        {searchable && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Search JSON..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            
            {searchMatches.length > 0 && (
              <Chip
                size="small"
                label={`${searchMatches.length} matches`}
                variant="outlined"
                color="primary"
              />
            )}
          </Box>
        )}

        {/* Display Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showRawJson}
                onChange={(e) => setShowRawJson(e.target.checked)}
                size="small"
              />
            }
            label="Raw JSON"
          />

          <FormControlLabel
            control={
              <Switch
                checked={currentTheme === 'dark'}
                onChange={(e) => setCurrentTheme(e.target.checked ? 'dark' : 'light')}
                size="small"
              />
            }
            label="Dark Theme"
          />

          {expandable && (
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Expand all">
                <Button onClick={handleExpandAll}>
                  <ExpandAllIcon />
                </Button>
              </Tooltip>
              <Tooltip title="Collapse all">
                <Button onClick={handleCollapseAll}>
                  <CollapseAllIcon />
                </Button>
              </Tooltip>
            </ButtonGroup>
          )}

          <ButtonGroup size="small" variant="outlined">
            <Tooltip title="Copy JSON">
              <Button onClick={handleCopy}>
                <CopyIcon />
              </Button>
            </Tooltip>
            
            {exportable && (
              <Tooltip title="Download JSON">
                <Button onClick={handleDownload}>
                  <DownloadIcon />
                </Button>
              </Tooltip>
            )}
          </ButtonGroup>
        </Box>
      </Box>

      {/* JSON Content */}
      <Paper
        sx={{
          maxHeight: maxHeight - 80,
          overflow: 'auto',
          p: 2,
          backgroundColor: currentTheme === 'dark' ? '#1e1e1e' : '#fafafa',
          color: currentTheme === 'dark' ? '#ffffff' : '#000000',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: 1.4,
        }}
        elevation={1}
      >
        {showRawJson ? (
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {jsonString}
          </pre>
        ) : (
          <JsonNode
            data={data}
            path="root"
            searchTerm={searchTerm}
            expandedPaths={expandedPaths}
            onToggleExpand={handleToggleExpand}
            theme={currentTheme}
            level={0}
          />
        )}
      </Paper>

      {/* JSON Statistics */}
      <Box sx={{ 
        mt: 1, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <Typography variant="caption" color="text.secondary">
          {Object.keys(data || {}).length} top-level properties
          {searchMatches.length > 0 && ` • ${searchMatches.length} search matches`}
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          {jsonString.length} characters
        </Typography>
      </Box>
    </Box>
  );
};

export default JsonViewer;