import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Menu,
  MenuItem,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Save,
  Delete,
  Edit,
  MoreVert,
  PlayArrow,
  Share,
  Download,
  Upload,
  Star,
  StarBorder,
} from '@mui/icons-material';
import type { Tool } from '../../types/index';

export interface ExecutionTemplate {
  id: string;
  name: string;
  description?: string;
  toolId: string;
  inputs: Record<string, any>;
  metadata?: {
    tags?: string[];
    category?: string;
    isPublic?: boolean;
    isFavorite?: boolean;
    usageCount?: number;
    lastUsed?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionTemplatesProps {
  tool: Tool;
  currentInputs?: Record<string, any>;
  onTemplateApply?: (template: ExecutionTemplate) => void;
  onTemplateSave?: (template: ExecutionTemplate) => void;
}

export function ExecutionTemplates({ 
  tool, 
  currentInputs = {},
  onTemplateApply,
  onTemplateSave 
}: ExecutionTemplatesProps) {
  const [templates, setTemplates] = useState<ExecutionTemplate[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExecutionTemplate | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ExecutionTemplate | null>(null);
  const [saveDialogData, setSaveDialogData] = useState({
    name: '',
    description: '',
    tags: '',
    category: '',
    isPublic: false,
  });
  const [importData, setImportData] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, [tool.id]);

  const loadTemplates = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('execution-templates') || '[]');
      const toolTemplates = saved.filter((t: ExecutionTemplate) => t.toolId === tool.id);
      setTemplates(toolTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const saveTemplate = (templateData: typeof saveDialogData) => {
    if (!templateData.name.trim()) {
      return;
    }

    const template: ExecutionTemplate = {
      id: editingTemplate?.id || `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: templateData.name.trim(),
      description: templateData.description.trim() || undefined,
      toolId: tool.id,
      inputs: { ...currentInputs },
      metadata: {
        tags: templateData.tags.split(',').map(t => t.trim()).filter(t => t),
        category: templateData.category.trim() || undefined,
        isPublic: templateData.isPublic,
        isFavorite: false,
        usageCount: editingTemplate?.metadata?.usageCount || 0,
        lastUsed: editingTemplate?.metadata?.lastUsed,
      },
      createdAt: editingTemplate?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const allTemplates = JSON.parse(localStorage.getItem('execution-templates') || '[]');
    
    if (editingTemplate) {
      // Update existing template
      const index = allTemplates.findIndex((t: ExecutionTemplate) => t.id === editingTemplate.id);
      if (index !== -1) {
        allTemplates[index] = template;
      }
    } else {
      // Add new template
      allTemplates.push(template);
    }

    localStorage.setItem('execution-templates', JSON.stringify(allTemplates));
    loadTemplates();
    
    onTemplateSave?.(template);
    
    setShowSaveDialog(false);
    setEditingTemplate(null);
    resetSaveDialog();
  };

  const deleteTemplate = (templateId: string) => {
    const allTemplates = JSON.parse(localStorage.getItem('execution-templates') || '[]');
    const updatedTemplates = allTemplates.filter((t: ExecutionTemplate) => t.id !== templateId);
    localStorage.setItem('execution-templates', JSON.stringify(updatedTemplates));
    loadTemplates();
    setMenuAnchor(null);
  };

  const applyTemplate = (template: ExecutionTemplate) => {
    // Update usage count
    template.metadata = {
      ...template.metadata,
      usageCount: (template.metadata?.usageCount || 0) + 1,
      lastUsed: new Date(),
    };

    const allTemplates = JSON.parse(localStorage.getItem('execution-templates') || '[]');
    const index = allTemplates.findIndex((t: ExecutionTemplate) => t.id === template.id);
    if (index !== -1) {
      allTemplates[index] = template;
      localStorage.setItem('execution-templates', JSON.stringify(allTemplates));
    }

    onTemplateApply?.(template);
    loadTemplates();
  };

  const toggleFavorite = (template: ExecutionTemplate) => {
    template.metadata = {
      ...template.metadata,
      isFavorite: !template.metadata?.isFavorite,
    };

    const allTemplates = JSON.parse(localStorage.getItem('execution-templates') || '[]');
    const index = allTemplates.findIndex((t: ExecutionTemplate) => t.id === template.id);
    if (index !== -1) {
      allTemplates[index] = template;
      localStorage.setItem('execution-templates', JSON.stringify(allTemplates));
    }

    loadTemplates();
    setMenuAnchor(null);
  };

  const exportTemplate = (template: ExecutionTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setMenuAnchor(null);
  };

  const importTemplate = () => {
    try {
      const template: ExecutionTemplate = JSON.parse(importData);
      
      // Validate template structure
      if (!template.name || !template.inputs || template.toolId !== tool.id) {
        throw new Error('Invalid template format or incompatible tool');
      }

      // Generate new ID to avoid conflicts
      template.id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      template.createdAt = new Date();
      template.updatedAt = new Date();

      const allTemplates = JSON.parse(localStorage.getItem('execution-templates') || '[]');
      allTemplates.push(template);
      localStorage.setItem('execution-templates', JSON.stringify(allTemplates));
      
      loadTemplates();
      setShowImportDialog(false);
      setImportData('');
    } catch (error) {
      console.error('Failed to import template:', error);
    }
  };

  const resetSaveDialog = () => {
    setSaveDialogData({
      name: '',
      description: '',
      tags: '',
      category: '',
      isPublic: false,
    });
  };

  const openSaveDialog = () => {
    resetSaveDialog();
    setEditingTemplate(null);
    setShowSaveDialog(true);
  };

  const openEditDialog = (template: ExecutionTemplate) => {
    setSaveDialogData({
      name: template.name,
      description: template.description || '',
      tags: template.metadata?.tags?.join(', ') || '',
      category: template.metadata?.category || '',
      isPublic: template.metadata?.isPublic || false,
    });
    setEditingTemplate(template);
    setShowSaveDialog(true);
    setMenuAnchor(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, template: ExecutionTemplate) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTemplate(null);
  };

  const getFilteredTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.metadata?.tags?.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(template => 
        template.metadata?.category === filterCategory
      );
    }

    return filtered.sort((a, b) => {
      // Sort by favorites first, then by usage count, then by name
      if (a.metadata?.isFavorite && !b.metadata?.isFavorite) return -1;
      if (!a.metadata?.isFavorite && b.metadata?.isFavorite) return 1;
      
      const aUsage = a.metadata?.usageCount || 0;
      const bUsage = b.metadata?.usageCount || 0;
      if (aUsage !== bUsage) return bUsage - aUsage;
      
      return a.name.localeCompare(b.name);
    });
  };

  const getCategories = () => {
    const categories = new Set<string>();
    templates.forEach(template => {
      if (template.metadata?.category) {
        categories.add(template.metadata.category);
      }
    });
    return Array.from(categories).sort();
  };

  const canSaveTemplate = Object.keys(currentInputs).length > 0;
  const filteredTemplates = getFilteredTemplates();

  return (
    <Card>
      <CardHeader
        title="Execution Templates"
        subheader={`Saved configurations for ${tool.name}`}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Import Template">
              <IconButton onClick={() => setShowImportDialog(true)}>
                <Upload />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={openSaveDialog}
              disabled={!canSaveTemplate}
            >
              Save Current
            </Button>
          </Box>
        }
      />
      
      <CardContent>
        {!canSaveTemplate && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Configure tool inputs to save as a template
          </Alert>
        )}

        {/* Search and Filter */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <TextField
            select
            label="Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All</MenuItem>
            {getCategories().map(category => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <Grid container spacing={2}>
            {filteredTemplates.map(template => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" component="h3">
                            {template.name}
                          </Typography>
                          {template.metadata?.isFavorite && (
                            <Star color="warning" fontSize="small" />
                          )}
                        </Box>
                        
                        {template.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {template.description}
                          </Typography>
                        )}

                        {/* Template Tags */}
                        {template.metadata?.tags && template.metadata.tags.length > 0 && (
                          <Box sx={{ mb: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {template.metadata.tags.map(tag => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        )}

                        {/* Usage Stats */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          {template.metadata?.usageCount !== undefined && (
                            <Typography variant="caption" color="text.secondary">
                              Used {template.metadata.usageCount} times
                            </Typography>
                          )}
                          {template.metadata?.lastUsed && (
                            <Typography variant="caption" color="text.secondary">
                              Last: {new Date(template.metadata.lastUsed).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <IconButton
                        onClick={(e) => handleMenuOpen(e, template)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={() => applyTemplate(template)}
                        size="small"
                        fullWidth
                      >
                        Apply
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              {searchTerm || filterCategory !== 'all' 
                ? 'No templates match your search criteria'
                : 'No templates saved yet'}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Template Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedTemplate && applyTemplate(selectedTemplate)}>
          <PlayArrow sx={{ mr: 1 }} />
          Apply Template
        </MenuItem>
        <MenuItem onClick={() => selectedTemplate && toggleFavorite(selectedTemplate)}>
          {selectedTemplate?.metadata?.isFavorite ? (
            <>
              <StarBorder sx={{ mr: 1 }} />
              Remove from Favorites
            </>
          ) : (
            <>
              <Star sx={{ mr: 1 }} />
              Add to Favorites
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => selectedTemplate && openEditDialog(selectedTemplate)}>
          <Edit sx={{ mr: 1 }} />
          Edit Template
        </MenuItem>
        <MenuItem onClick={() => selectedTemplate && exportTemplate(selectedTemplate)}>
          <Download sx={{ mr: 1 }} />
          Export Template
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => selectedTemplate && deleteTemplate(selectedTemplate.id)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete Template
        </MenuItem>
      </Menu>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Edit Template' : 'Save Execution Template'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Template Name"
            fullWidth
            value={saveDialogData.name}
            onChange={(e) => setSaveDialogData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="My Execution Template"
          />
          
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={2}
            value={saveDialogData.description}
            onChange={(e) => setSaveDialogData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this template is for..."
          />

          <TextField
            margin="dense"
            label="Tags (comma-separated)"
            fullWidth
            value={saveDialogData.tags}
            onChange={(e) => setSaveDialogData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="analysis, testing, production"
          />

          <TextField
            margin="dense"
            label="Category (optional)"
            fullWidth
            value={saveDialogData.category}
            onChange={(e) => setSaveDialogData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="Data Analysis"
          />

          {/* Preview of inputs to be saved */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Inputs to save:
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
              <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                {JSON.stringify(currentInputs, null, 2)}
              </pre>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => saveTemplate(saveDialogData)} 
            variant="contained"
            disabled={!saveDialogData.name.trim()}
          >
            {editingTemplate ? 'Update Template' : 'Save Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Template Dialog */}
      <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Execution Template</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Paste the JSON content of an exported template:
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Template JSON"
            fullWidth
            multiline
            rows={10}
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder='{"id": "...", "name": "...", "inputs": {...}}'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)}>Cancel</Button>
          <Button 
            onClick={importTemplate} 
            variant="contained"
            disabled={!importData.trim()}
          >
            Import Template
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default ExecutionTemplates;