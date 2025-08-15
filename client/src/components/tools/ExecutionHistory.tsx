import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Tooltip,
  Checkbox,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  Delete,
  Compare,
  Download,
  Refresh,
  FilterList,
  Clear,
  PlayArrow,
  Share,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toolExecutionService } from '../../services/toolExecutionService';
import { ExecutionComparison } from './ExecutionComparison';
import { OutputRenderer } from '../output/OutputRenderer';
import type { ExecutionState, ExecutionResults } from '../../types/execution';

export interface ExecutionHistoryProps {
  toolId?: string; // If provided, show history for specific tool only
  onExecutionSelect?: (execution: ExecutionState) => void;
  onExecutionRerun?: (execution: ExecutionState) => void;
  enableComparison?: boolean;
  enableBulkActions?: boolean;
}

interface ExecutionFilter {
  status: string[];
  dateFrom?: Date;
  dateTo?: Date;
  toolId?: string;
  searchText: string;
  durationMin?: number;
  durationMax?: number;
  favorites: boolean;
}

interface ExecutionWithFavorite extends ExecutionState {
  isFavorite?: boolean;
}

export function ExecutionHistory({
  toolId,
  onExecutionSelect,
  onExecutionRerun,
  enableComparison = true,
  enableBulkActions = true
}: ExecutionHistoryProps) {
  const [executions, setExecutions] = useState<ExecutionWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtering
  const [filter, setFilter] = useState<ExecutionFilter>({
    status: [],
    searchText: '',
    favorites: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Selection
  const [selectedExecutions, setSelectedExecutions] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  // Menu and dialogs
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuExecution, setMenuExecution] = useState<ExecutionWithFavorite | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [detailsExecution, setDetailsExecution] = useState<ExecutionWithFavorite | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [executionToDelete, setExecutionToDelete] = useState<ExecutionWithFavorite | null>(null);

  // Load execution history
  useEffect(() => {
    loadExecutionHistory();
  }, [toolId]);

  const loadExecutionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const history = await toolExecutionService.getExecutionHistory(100); // Load last 100 executions
      
      let filteredHistory = toolId 
        ? history.filter(execution => execution.toolId === toolId)
        : history;
      
      // Load favorites from localStorage
      const favorites = new Set(JSON.parse(localStorage.getItem('favorite-executions') || '[]'));
      
      const historyWithFavorites = filteredHistory.map(execution => ({
        ...execution,
        isFavorite: favorites.has(execution.id),
      }));
      
      setExecutions(historyWithFavorites);
    } catch (error) {
      setError('Failed to load execution history');
      console.error('Failed to load execution history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter executions
  const filteredExecutions = useMemo(() => {
    return executions.filter(execution => {
      // Status filter
      if (filter.status.length > 0 && !filter.status.includes(execution.status)) {
        return false;
      }
      
      // Date range filter
      if (filter.dateFrom && execution.startTime < filter.dateFrom) {
        return false;
      }
      if (filter.dateTo && execution.startTime > filter.dateTo) {
        return false;
      }
      
      // Tool ID filter
      if (filter.toolId && execution.toolId !== filter.toolId) {
        return false;
      }
      
      // Search text filter
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const matchesId = execution.id.toLowerCase().includes(searchLower);
        const matchesToolId = execution.toolId.toLowerCase().includes(searchLower);
        const matchesStatus = execution.status.toLowerCase().includes(searchLower);
        
        if (!matchesId && !matchesToolId && !matchesStatus) {
          return false;
        }
      }
      
      // Duration filter
      if (filter.durationMin && (!execution.duration || execution.duration < filter.durationMin)) {
        return false;
      }
      if (filter.durationMax && (!execution.duration || execution.duration > filter.durationMax)) {
        return false;
      }
      
      // Favorites filter
      if (filter.favorites && !execution.isFavorite) {
        return false;
      }
      
      return true;
    });
  }, [executions, filter]);

  // Pagination
  const paginatedExecutions = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredExecutions.slice(start, end);
  }, [filteredExecutions, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, execution: ExecutionWithFavorite) => {
    setMenuAnchor(event.currentTarget);
    setMenuExecution(execution);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuExecution(null);
  };

  const handleViewDetails = (execution: ExecutionWithFavorite) => {
    setDetailsExecution(execution);
    setShowDetailsDialog(true);
    handleMenuClose();
    onExecutionSelect?.(execution);
  };

  const handleDeleteExecution = (execution: ExecutionWithFavorite) => {
    setExecutionToDelete(execution);
    setShowDeleteDialog(true);
    handleMenuClose();
  };

  const confirmDeleteExecution = () => {
    if (executionToDelete) {
      // Remove from local state
      setExecutions(prev => prev.filter(e => e.id !== executionToDelete.id));
      
      // Remove from selections
      setSelectedExecutions(prev => prev.filter(id => id !== executionToDelete.id));
      
      // Remove from favorites
      const favorites = new Set(JSON.parse(localStorage.getItem('favorite-executions') || '[]'));
      favorites.delete(executionToDelete.id);
      localStorage.setItem('favorite-executions', JSON.stringify(Array.from(favorites)));
    }
    
    setShowDeleteDialog(false);
    setExecutionToDelete(null);
  };

  const handleToggleFavorite = (execution: ExecutionWithFavorite) => {
    const favorites = new Set(JSON.parse(localStorage.getItem('favorite-executions') || '[]'));
    
    if (execution.isFavorite) {
      favorites.delete(execution.id);
    } else {
      favorites.add(execution.id);
    }
    
    localStorage.setItem('favorite-executions', JSON.stringify(Array.from(favorites)));
    
    setExecutions(prev => prev.map(e => 
      e.id === execution.id 
        ? { ...e, isFavorite: !e.isFavorite }
        : e
    ));
    
    handleMenuClose();
  };

  const handleSelectionChange = (executionId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedExecutions(prev => [...prev, executionId]);
    } else {
      setSelectedExecutions(prev => prev.filter(id => id !== executionId));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedExecutions(paginatedExecutions.map(e => e.id));
    } else {
      setSelectedExecutions([]);
    }
  };

  const handleBulkDelete = () => {
    setExecutions(prev => prev.filter(e => !selectedExecutions.includes(e.id)));
    setSelectedExecutions([]);
  };

  const handleExportSelected = () => {
    const selectedExecutionData = executions.filter(e => selectedExecutions.includes(e.id));
    const data = {
      executions: selectedExecutionData,
      exportedAt: new Date().toISOString(),
      totalCount: selectedExecutionData.length,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `execution_history_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'cancelled': return 'warning';
      case 'running': return 'primary';
      default: return 'default';
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const clearFilters = () => {
    setFilter({
      status: [],
      searchText: '',
      favorites: false,
    });
    setPage(0);
  };

  const getSelectedExecutions = () => {
    return executions.filter(e => selectedExecutions.includes(e.id));
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading execution history...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card>
        <CardHeader
          title="Execution History"
          subheader={`${filteredExecutions.length} executions`}
          action={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {selectedExecutions.length > 0 && enableComparison && (
                <Button
                  variant="outlined"
                  startIcon={<Compare />}
                  onClick={() => setShowComparison(true)}
                  disabled={selectedExecutions.length < 2}
                >
                  Compare ({selectedExecutions.length})
                </Button>
              )}
              
              <Tooltip title="Toggle Filters">
                <IconButton onClick={() => setShowFilters(!showFilters)}>
                  <FilterList />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Refresh">
                <IconButton onClick={loadExecutionHistory}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        
        <CardContent>
          {/* Filters */}
          {showFilters && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search"
                    placeholder="Search executions..."
                    value={filter.searchText}
                    onChange={(e) => setFilter(prev => ({ ...prev, searchText: e.target.value }))}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      multiple
                      value={filter.status}
                      onChange={(e) => setFilter(prev => ({ 
                        ...prev, 
                        status: typeof e.target.value === 'string' ? [e.target.value] : e.target.value 
                      }))}
                      label="Status"
                    >
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                      <MenuItem value="running">Running</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="From Date"
                    value={filter.dateFrom || null}
                    onChange={(date) => setFilter(prev => ({ ...prev, dateFrom: date || undefined }))}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="To Date"
                    value={filter.dateTo || null}
                    onChange={(date) => setFilter(prev => ({ ...prev, dateTo: date || undefined }))}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  startIcon={<Clear />}
                  onClick={clearFilters}
                  size="small"
                >
                  Clear Filters
                </Button>
                
                <Button
                  startIcon={filter.favorites ? <Star /> : <StarBorder />}
                  onClick={() => setFilter(prev => ({ ...prev, favorites: !prev.favorites }))}
                  size="small"
                  color={filter.favorites ? 'primary' : 'inherit'}
                >
                  Favorites Only
                </Button>
              </Box>
            </Box>
          )}

          {/* Bulk Actions */}
          {enableBulkActions && selectedExecutions.length > 0 && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'primary.50', borderRadius: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2">
                {selectedExecutions.length} selected
              </Typography>
              
              <Button size="small" onClick={handleExportSelected} startIcon={<Download />}>
                Export
              </Button>
              
              {enableComparison && selectedExecutions.length >= 2 && (
                <Button size="small" onClick={() => setShowComparison(true)} startIcon={<Compare />}>
                  Compare
                </Button>
              )}
              
              <Button size="small" onClick={handleBulkDelete} color="error" startIcon={<Delete />}>
                Delete
              </Button>
              
              <Button size="small" onClick={() => setSelectedExecutions([])}>
                Clear Selection
              </Button>
            </Box>
          )}

          {/* Execution Table */}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {enableBulkActions && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedExecutions.length > 0 && selectedExecutions.length < paginatedExecutions.length}
                        checked={paginatedExecutions.length > 0 && selectedExecutions.length === paginatedExecutions.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableCell>
                  )}
                  <TableCell>Execution</TableCell>
                  <TableCell>Tool</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Duration</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedExecutions.map((execution) => (
                  <TableRow key={execution.id} hover>
                    {enableBulkActions && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedExecutions.includes(execution.id)}
                          onChange={(e) => handleSelectionChange(execution.id, e.target.checked)}
                        />
                      </TableCell>
                    )}
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontFamily="monospace">
                          {execution.id.substring(0, 8)}...
                        </Typography>
                        {execution.isFavorite && (
                          <Star color="warning" fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {execution.toolId}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={execution.status}
                        color={getStatusColor(execution.status) as any}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2" fontFamily="monospace">
                        {formatDuration(execution.duration)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {execution.startTime.toLocaleString()}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, execution)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredExecutions.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => menuExecution && handleViewDetails(menuExecution)}>
            <Visibility sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          
          {onExecutionRerun && (
            <MenuItem onClick={() => {
              if (menuExecution) {
                onExecutionRerun(menuExecution);
                handleMenuClose();
              }
            }}>
              <PlayArrow sx={{ mr: 1 }} />
              Rerun Execution
            </MenuItem>
          )}
          
          <MenuItem onClick={() => menuExecution && handleToggleFavorite(menuExecution)}>
            {menuExecution?.isFavorite ? (
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
          
          <Divider />
          
          <MenuItem onClick={() => menuExecution && handleDeleteExecution(menuExecution)}>
            <Delete sx={{ mr: 1 }} color="error" />
            Delete Execution
          </MenuItem>
        </Menu>

        {/* Execution Details Dialog */}
        <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Execution Details</DialogTitle>
          <DialogContent>
            {detailsExecution && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Execution ID</Typography>
                    <Typography variant="body1" fontFamily="monospace">{detailsExecution.id}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Tool</Typography>
                    <Typography variant="body1">{detailsExecution.toolId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Chip label={detailsExecution.status} color={getStatusColor(detailsExecution.status) as any} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                    <Typography variant="body1">{formatDuration(detailsExecution.duration)}</Typography>
                  </Grid>
                </Grid>

                {detailsExecution.results && (
                  <OutputRenderer
                    data={detailsExecution.results.results}
                    metadata={detailsExecution.results.metadata}
                    title="Execution Results"
                  />
                )}

                {detailsExecution.error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">{detailsExecution.error.message}</Typography>
                    {detailsExecution.error.details && (
                      <Typography variant="body2" component="pre" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        {JSON.stringify(detailsExecution.error.details, null, 2)}
                      </Typography>
                    )}
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
          <DialogTitle>Delete Execution</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this execution? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button onClick={confirmDeleteExecution} color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Comparison Dialog */}
        <Dialog open={showComparison} onClose={() => setShowComparison(false)} maxWidth="xl" fullWidth>
          <DialogTitle>Execution Comparison</DialogTitle>
          <DialogContent>
            <ExecutionComparison
              executions={getSelectedExecutions()}
              onRemoveExecution={(executionId) => {
                setSelectedExecutions(prev => prev.filter(id => id !== executionId));
              }}
              onViewExecution={handleViewDetails}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowComparison(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Card>
    </LocalizationProvider>
  );
}

export default ExecutionHistory;