/**
 * HTML Viewer Component
 * 
 * Renders HTML content safely with XSS protection
 */

import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Code as CodeIcon,
  Visibility as PreviewIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import DOMPurify from 'isomorphic-dompurify';

export interface HtmlViewerProps {
  data: string;
  title?: string;
  maxHeight?: number;
  showRawHtml?: boolean;
}

export function HtmlViewer({ 
  data, 
  title = 'HTML Output',
  maxHeight = 400,
  showRawHtml = false
}: HtmlViewerProps) {
  const [viewMode, setViewMode] = React.useState<'preview' | 'code'>('preview');

  // Sanitize HTML to prevent XSS
  const sanitizedHtml = useMemo(() => {
    if (typeof data !== 'string') {
      return '<p>Invalid HTML data</p>';
    }
    
    try {
      return DOMPurify.sanitize(data, {
        ALLOWED_TAGS: [
          'div', 'span', 'p', 'br', 'strong', 'em', 'b', 'i', 'u',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'a', 'img',
          'code', 'pre'
        ],
        ALLOWED_ATTR: [
          'style', 'class', 'id', 'href', 'src', 'alt', 'title'
        ]
      });
    } catch (error) {
      console.error('HTML sanitization error:', error);
      return '<p>Error processing HTML content</p>';
    }
  }, [data]);

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(data);
    } catch (error) {
      console.error('Failed to copy HTML:', error);
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'preview' ? 'code' : 'preview');
  };

  if (!data || typeof data !== 'string') {
    return (
      <Alert severity="warning">
        Invalid or missing HTML data
      </Alert>
    );
  }

  return (
    <Paper elevation={1} sx={{ overflow: 'hidden' }}>
      {/* Header with controls */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 2, 
        py: 1, 
        bgcolor: 'grey.50',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <Tooltip title={viewMode === 'preview' ? 'Show HTML code' : 'Show preview'}>
            <IconButton
              size="small"
              onClick={toggleViewMode}
              color={viewMode === 'code' ? 'primary' : 'default'}
            >
              {viewMode === 'preview' ? <CodeIcon /> : <PreviewIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Copy HTML to clipboard">
            <IconButton size="small" onClick={handleCopyHtml}>
              <CopyIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ 
        maxHeight, 
        overflow: 'auto',
        p: 2
      }}>
        {viewMode === 'preview' ? (
          // Rendered HTML preview
          <Box
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            sx={{
              '& *': {
                maxWidth: '100%'
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto'
              },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse'
              },
              '& th, & td': {
                border: 1,
                borderColor: 'divider',
                p: 1
              }
            }}
          />
        ) : (
          // Raw HTML code
          <Box
            component="pre"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto'
            }}
          >
            {data}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default HtmlViewer;