/**
 * TextViewer component for displaying text content with syntax highlighting and search
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Typography,
  ButtonGroup,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  KeyboardArrowUp as PrevIcon,
  KeyboardArrowDown as NextIcon,
  WrapText as WrapTextIcon,
  FormatSize as FontSizeIcon,
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { 
  prism, 
  tomorrow, 
  okaidia, 
  solarizedlight,
  vscDarkPlus,
  oneLight 
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { TextViewerProps } from '../../types/output';

// Available themes
const THEMES = {
  light: { style: oneLight, name: 'Light' },
  dark: { style: vscDarkPlus, name: 'Dark' },
  prism: { style: prism, name: 'Prism' },
  tomorrow: { style: tomorrow, name: 'Tomorrow' },
  okaidia: { style: okaidia, name: 'Okaidia' },
  solarized: { style: solarizedlight, name: 'Solarized' },
};

// Font sizes
const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24];

export const TextViewer: React.FC<TextViewerProps> = ({
  content,
  language: initialLanguage,
  searchable = true,
  lineNumbers = true,
  maxHeight = 400,
  exportable = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatch, setCurrentMatch] = useState(0);
  const [language, setLanguage] = useState(initialLanguage || detectLanguage(content));
  const [theme, setTheme] = useState<keyof typeof THEMES>('light');
  const [fontSize, setFontSize] = useState(14);
  const [wrapLines, setWrapLines] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const highlighterRef = useRef<HTMLDivElement>(null);

  // Detect programming language from content
  function detectLanguage(text: string): string {
    if (!text) return 'text';

    const patterns = {
      javascript: [/function\s+\w+\s*\(/i, /const\s+\w+\s*=/i, /=>\s*{/, /import\s+.*from/i],
      typescript: [/interface\s+\w+/i, /type\s+\w+\s*=/i, /as\s+\w+/i],
      python: [/def\s+\w+\s*\(/i, /import\s+\w+/i, /if\s+__name__\s*==\s*['""]__main__['"']/],
      json: [/^\s*[{\[]/, /[}\]]\s*$/, /"[\w-]+"\s*:/],
      xml: [/<\?xml/i, /<\/\w+>/i, /<\w+[^>]*>/],
      html: [/<!DOCTYPE\s+html/i, /<html/i, /<\/html>/i],
      css: [/\w+\s*:\s*[^;]+;/i, /\.\w+\s*{/i, /@media\s+/i],
      sql: [/SELECT\s+.*\s+FROM\s+/i, /INSERT\s+INTO\s+/i, /UPDATE\s+.*\s+SET\s+/i],
      bash: [/#!/i, /\$\w+/, /\|\s*\w+/],
      yaml: [/^[\w-]+:\s*$/m, /^\s*-\s+/m],
      markdown: [/^#+\s+/m, /\[.*\]\(.*\)/],
    };

    for (const [lang, langPatterns] of Object.entries(patterns)) {
      const matches = langPatterns.filter(pattern => pattern.test(text)).length;
      if (matches >= 2) {
        return lang;
      }
    }

    return 'text';
  }

  // Find all matches for search term
  const searchMatches = useMemo(() => {
    if (!searchTerm || !searchable) return [];

    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches: Array<{ index: number; line: number; column: number }> = [];
    const lines = content.split('\n');

    lines.forEach((line, lineIndex) => {
      let match;
      while ((match = regex.exec(line)) !== null) {
        matches.push({
          index: match.index,
          line: lineIndex + 1,
          column: match.index + 1,
        });
      }
    });

    return matches;
  }, [content, searchTerm, searchable]);

  // Highlight search matches in content
  const highlightedContent = useMemo(() => {
    if (!searchTerm || !searchable || searchMatches.length === 0) {
      return content;
    }

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return content.replace(regex, '→→→HIGHLIGHT_START→→→$1→→→HIGHLIGHT_END→→→');
  }, [content, searchTerm, searchable, searchMatches]);

  // Navigate to next/previous search match
  const navigateMatch = useCallback((direction: 'next' | 'prev') => {
    if (searchMatches.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = currentMatch >= searchMatches.length - 1 ? 0 : currentMatch + 1;
    } else {
      newIndex = currentMatch <= 0 ? searchMatches.length - 1 : currentMatch - 1;
    }

    setCurrentMatch(newIndex);

    // Scroll to match (simplified implementation)
    if (highlighterRef.current) {
      const lineHeight = fontSize * 1.5;
      const targetLine = searchMatches[newIndex].line;
      const scrollTop = (targetLine - 5) * lineHeight;
      highlighterRef.current.scrollTop = Math.max(0, scrollTop);
    }
  }, [searchMatches, currentMatch, fontSize]);

  // Copy content to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }, [content]);

  // Download content as file
  const handleDownload = useCallback(() => {
    if (!exportable) return;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `text-content.${language === 'text' ? 'txt' : language}`;
    link.click();
    URL.revokeObjectURL(url);
  }, [content, language, exportable]);

  // Custom renderer for syntax highlighter to handle search highlights
  const customRenderer = useCallback(({ rows, stylesheet, useInlineStyles }: any) => {
    return rows.map((row: any, index: number) => {
      const lineNumber = index + 1;
      const hasMatch = searchMatches.some(match => match.line === lineNumber);
      const isCurrentMatch = searchMatches[currentMatch]?.line === lineNumber;

      return (
        <div
          key={index}
          style={{
            ...row.props?.style,
            backgroundColor: isCurrentMatch 
              ? 'rgba(255, 235, 59, 0.3)' 
              : hasMatch 
                ? 'rgba(255, 245, 157, 0.2)' 
                : undefined,
            padding: '2px 4px',
          }}
        >
          {row.children.map((child: any, childIndex: number) => {
            if (typeof child.props?.children === 'string') {
              const text = child.props.children;
              if (text.includes('→→→HIGHLIGHT_START→→→')) {
                const parts = text.split(/→→→HIGHLIGHT_START→→→|→→→HIGHLIGHT_END→→→/);
                return (
                  <span key={childIndex} style={child.props?.style}>
                    {parts.map((part: string, partIndex: number) => 
                      partIndex % 2 === 1 ? (
                        <mark key={partIndex} style={{ backgroundColor: '#ffeb3b', color: 'black' }}>
                          {part}
                        </mark>
                      ) : (
                        part
                      )
                    )}
                  </span>
                );
              }
            }
            return child;
          })}
        </div>
      );
    });
  }, [searchMatches, currentMatch]);

  if (!content) {
    return (
      <Box sx={{ maxHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="info">
          <Typography variant="body2">
            No text content provided.
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
        {/* Search Controls */}
        {searchable && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Search in text..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentMatch(0);
              }}
              onFocus={() => setShowSearch(true)}
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
              <>
                <Chip
                  size="small"
                  label={`${currentMatch + 1}/${searchMatches.length}`}
                  variant="outlined"
                />
                <ButtonGroup size="small">
                  <Tooltip title="Previous match">
                    <IconButton onClick={() => navigateMatch('prev')}>
                      <PrevIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Next match">
                    <IconButton onClick={() => navigateMatch('next')}>
                      <NextIcon />
                    </IconButton>
                  </Tooltip>
                </ButtonGroup>
              </>
            )}
          </Box>
        )}

        {/* Display Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={language}
              label="Language"
              onChange={(e) => setLanguage(e.target.value)}
            >
              <MenuItem value="text">Plain Text</MenuItem>
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="typescript">TypeScript</MenuItem>
              <MenuItem value="python">Python</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="xml">XML</MenuItem>
              <MenuItem value="html">HTML</MenuItem>
              <MenuItem value="css">CSS</MenuItem>
              <MenuItem value="sql">SQL</MenuItem>
              <MenuItem value="bash">Bash</MenuItem>
              <MenuItem value="yaml">YAML</MenuItem>
              <MenuItem value="markdown">Markdown</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 80 }}>
            <InputLabel>Theme</InputLabel>
            <Select
              value={theme}
              label="Theme"
              onChange={(e) => setTheme(e.target.value as keyof typeof THEMES)}
            >
              {Object.entries(THEMES).map(([key, { name }]) => (
                <MenuItem key={key} value={key}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 60 }}>
            <InputLabel>Size</InputLabel>
            <Select
              value={fontSize}
              label="Size"
              onChange={(e) => setFontSize(e.target.value as number)}
            >
              {FONT_SIZES.map(size => (
                <MenuItem key={size} value={size}>
                  {size}px
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="Toggle line wrap">
            <IconButton
              size="small"
              onClick={() => setWrapLines(!wrapLines)}
              color={wrapLines ? 'primary' : 'default'}
            >
              <WrapTextIcon />
            </IconButton>
          </Tooltip>

          <ButtonGroup size="small" variant="outlined">
            <Tooltip title="Copy text">
              <Button onClick={handleCopy}>
                <CopyIcon />
              </Button>
            </Tooltip>
            
            {exportable && (
              <Tooltip title="Download as file">
                <Button onClick={handleDownload}>
                  <DownloadIcon />
                </Button>
              </Tooltip>
            )}
          </ButtonGroup>
        </Box>
      </Box>

      {/* Text Content */}
      <Paper
        ref={highlighterRef}
        sx={{
          maxHeight: maxHeight - 80,
          overflow: 'auto',
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        }}
        elevation={1}
      >
        <SyntaxHighlighter
          language={language}
          style={THEMES[theme].style}
          showLineNumbers={lineNumbers}
          wrapLines={wrapLines}
          wrapLongLines={wrapLines}
          customStyle={{
            margin: 0,
            fontSize: `${fontSize}px`,
            lineHeight: 1.5,
            background: 'transparent',
          }}
          codeTagProps={{
            style: {
              fontSize: `${fontSize}px`,
            },
          }}
          renderer={searchTerm ? customRenderer : undefined}
        >
          {highlightedContent}
        </SyntaxHighlighter>
      </Paper>

      {/* Text Statistics */}
      <Box sx={{ 
        mt: 1, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <Typography variant="caption" color="text.secondary">
          {content.split('\n').length} lines, {content.length} characters
          {searchMatches.length > 0 && ` • ${searchMatches.length} matches`}
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          Language: {language.toUpperCase()}
        </Typography>
      </Box>
    </Box>
  );
};

export default TextViewer;