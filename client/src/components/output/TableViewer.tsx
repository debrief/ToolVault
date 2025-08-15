/**
 * TableViewer component for rendering interactive data tables with advanced features
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  TextField,
  ButtonGroup,
  Button,
  Typography,
  Paper,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  ViewColumn as ViewColumnIcon,
} from '@mui/icons-material';
import { 
  DataGrid, 
  GridColDef, 
  GridRowId,
  GridToolbar,
  GridValueGetterParams
} from '@mui/x-data-grid';
import * as XLSX from 'xlsx';
import type { TableViewerProps } from '../../types/output';

export const TableViewer: React.FC<TableViewerProps> = ({
  data,
  columns,
  height = 400,
  searchable = true,
  exportable = true,
  selectable = false,
  pageSize = 25,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  // Auto-generate columns if not provided
  const tableColumns = useMemo((): GridColDef[] => {
    if (columns) return columns;
    
    if (!data || data.length === 0) return [];
    
    const sampleRow = data[0];
    return Object.keys(sampleRow).map((key): GridColDef => {
      const sampleValue = sampleRow[key];
      
      return {
        field: key,
        headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        width: getColumnWidth(key, sampleValue),
        type: inferColumnType(sampleValue),
        filterable: true,
        sortable: true,
        hide: columnVisibility[key] === false,
        renderCell: (params) => renderCellContent(params.value, key),
        valueGetter: (params: GridValueGetterParams) => {
          const value = params.row[key];
          return formatCellValue(value);
        },
      };
    });
  }, [data, columns, columnVisibility]);

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!searchText || !searchable) return data;
    
    const searchLower = searchText.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [data, searchText, searchable]);

  // Prepare rows with unique IDs
  const tableRows = useMemo(() => {
    return filteredData.map((row, index) => ({
      id: row.id || index,
      ...row,
    }));
  }, [filteredData]);

  // Handle export functionality
  const handleExport = useCallback((format: 'csv' | 'json' | 'excel') => {
    if (!exportable) return;

    const exportData = selectedRows.length > 0
      ? filteredData.filter((_, index) => selectedRows.includes(index))
      : filteredData;

    switch (format) {
      case 'csv':
        exportToCSV(exportData, tableColumns);
        break;
      case 'json':
        exportToJSON(exportData);
        break;
      case 'excel':
        exportToExcel(exportData, tableColumns);
        break;
    }
  }, [exportable, selectedRows, filteredData, tableColumns]);

  // Toggle column visibility
  const handleColumnVisibility = useCallback((columnField: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnField]: !prev[columnField],
    }));
  }, []);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            No Data Available
          </Typography>
          <Typography variant="body2">
            No table data provided for rendering.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height, width: '100%' }}>
      {/* Table Controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        flexWrap: 'wrap',
        gap: 1
      }}>
        {/* Search */}
        {searchable && (
          <TextField
            size="small"
            placeholder="Search table..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: searchText && (
                <IconButton
                  size="small"
                  onClick={() => setSearchText('')}
                  sx={{ p: 0.5 }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
        )}

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Column Visibility Toggle */}
          <Tooltip title="Toggle columns">
            <IconButton
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              size="small"
            >
              <ViewColumnIcon />
            </IconButton>
          </Tooltip>

          {/* Export Buttons */}
          {exportable && (
            <ButtonGroup variant="outlined" size="small">
              <Button 
                onClick={() => handleExport('csv')}
                startIcon={<DownloadIcon />}
              >
                CSV
              </Button>
              <Button 
                onClick={() => handleExport('json')}
                startIcon={<DownloadIcon />}
              >
                JSON
              </Button>
              <Button 
                onClick={() => handleExport('excel')}
                startIcon={<DownloadIcon />}
              >
                Excel
              </Button>
            </ButtonGroup>
          )}
        </Box>
      </Box>

      {/* Column Visibility Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
          Toggle Columns
        </Typography>
        {tableColumns.map((column) => (
          <MenuItem
            key={column.field}
            onClick={() => handleColumnVisibility(column.field)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography variant="body2">
                {column.headerName}
              </Typography>
              <Chip
                size="small"
                color={columnVisibility[column.field] === false ? 'default' : 'primary'}
                label={columnVisibility[column.field] === false ? 'Hidden' : 'Visible'}
                variant="outlined"
              />
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Data Grid */}
      <Paper sx={{ height: height - 100, width: '100%' }} elevation={1}>
        <DataGrid
          rows={tableRows}
          columns={tableColumns}
          checkboxSelection={selectable}
          disableRowSelectionOnClick={!selectable}
          onRowSelectionModelChange={setSelectedRows}
          density="compact"
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: pageSize },
            },
          }}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: searchable,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #e0e0e0',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: 'grey.50',
              fontWeight: 'bold',
            },
          }}
        />
      </Paper>

      {/* Table Summary */}
      <Box sx={{ 
        mt: 1, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredData.length} of {data.length} rows
          {selectedRows.length > 0 && ` (${selectedRows.length} selected)`}
        </Typography>
        
        {selectedRows.length > 0 && (
          <Button
            size="small"
            onClick={() => setSelectedRows([])}
            startIcon={<ClearIcon />}
            variant="outlined"
          >
            Clear Selection
          </Button>
        )}
      </Box>
    </Box>
  );
};

// Helper functions
function getColumnWidth(key: string, sampleValue: any): number {
  const minWidth = 100;
  const maxWidth = 300;
  
  if (typeof sampleValue === 'boolean') return 80;
  if (typeof sampleValue === 'number') return 120;
  if (typeof sampleValue === 'string') {
    const length = Math.max(key.length, sampleValue.length);
    return Math.min(Math.max(length * 8, minWidth), maxWidth);
  }
  
  return minWidth;
}

function inferColumnType(sampleValue: any): string {
  if (typeof sampleValue === 'number') return 'number';
  if (typeof sampleValue === 'boolean') return 'boolean';
  if (sampleValue instanceof Date) return 'date';
  if (typeof sampleValue === 'string') {
    // Check for date strings
    if (!isNaN(Date.parse(sampleValue))) return 'dateTime';
    return 'string';
  }
  return 'string';
}

function renderCellContent(value: any, columnKey: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <Typography variant="body2" color="text.secondary">—</Typography>;
  }

  if (typeof value === 'boolean') {
    return (
      <Chip
        label={value ? 'True' : 'False'}
        color={value ? 'success' : 'default'}
        size="small"
        variant="outlined"
      />
    );
  }

  if (typeof value === 'number') {
    return (
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        {value.toLocaleString()}
      </Typography>
    );
  }

  if (typeof value === 'string' && value.length > 50) {
    return (
      <Tooltip title={value}>
        <Typography variant="body2" sx={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {value}
        </Typography>
      </Tooltip>
    );
  }

  return (
    <Typography variant="body2">
      {String(value)}
    </Typography>
  );
}

function formatCellValue(value: any): any {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

// Export utility functions
function exportToCSV(data: any[], columns: GridColDef[]): void {
  const headers = columns.map(col => col.headerName || col.field);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      columns.map(col => {
        const value = row[col.field];
        const stringValue = value === null || value === undefined ? '' : String(value);
        // Escape commas and quotes
        return stringValue.includes(',') || stringValue.includes('"') 
          ? `"${stringValue.replace(/"/g, '""')}"` 
          : stringValue;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, 'table-data.csv', 'text/csv');
}

function exportToJSON(data: any[]): void {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, 'table-data.json', 'application/json');
}

function exportToExcel(data: any[], columns: GridColDef[]): void {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column headers
  const headers = columns.map(col => col.headerName || col.field);
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, 'table-data.xlsx');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default TableViewer;