import React, { useState, useMemo } from 'react';
import { saveAs } from 'file-saver';
import './TableViewer.css';

interface TableViewerProps {
  data: unknown;
  maxRows?: number;
}

type TableRow = Record<string, unknown>;

type SortDirection = 'asc' | 'desc' | null;

const isTableData = (data: unknown): data is TableRow[] => {
  if (!Array.isArray(data) || data.length === 0) return false;
  
  const firstItem = data[0];
  return typeof firstItem === 'object' && firstItem !== null;
};

const flattenObject = (obj: unknown, prefix = ''): Record<string, unknown> => {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return { [prefix || 'value']: obj };
  }
  
  const result: Record<string, unknown> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  });
  
  return result;
};

const normalizeTableData = (data: TableRow[]): TableRow[] => {
  return data.map((row, index) => {
    if (typeof row === 'object' && row !== null) {
      return { ...flattenObject(row), _index: index };
    }
    return { value: row, _index: index };
  });
};

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  if (typeof value === 'number') {
    // Round to 6 decimal places for better display
    return Number.isInteger(value) ? value.toString() : value.toFixed(6).replace(/\.?0+$/, '');
  }
  
  if (Array.isArray(value)) {
    return `[${value.length} items]`;
  }
  
  if (typeof value === 'object') {
    return '[Object]';
  }
  
  return String(value);
};

const exportToCSV = (data: TableRow[], columns: string[]): void => {
  const headers = columns.filter(col => col !== '_index').join(',');
  const rows = data.map(row => 
    columns
      .filter(col => col !== '_index')
      .map(col => {
        const value = formatCellValue(row[col]);
        return `"${value.replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'table-data.csv');
};

export const TableViewer: React.FC<TableViewerProps> = ({ data }) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const isValid = isTableData(data);
  const normalizedData = useMemo(() => 
    isValid ? normalizeTableData(data) : [], [data, isValid]);
  
  const columns = useMemo(() => {
    if (normalizedData.length === 0) return [];
    
    const allKeys = new Set<string>();
    normalizedData.forEach(row => {
      Object.keys(row).forEach(key => allKeys.add(key));
    });
    
    return Array.from(allKeys).sort();
  }, [normalizedData]);

  const filteredData = useMemo(() => {
    if (!filterText) return normalizedData;
    
    const lowercaseFilter = filterText.toLowerCase();
    return normalizedData.filter(row =>
      Object.values(row).some(value =>
        formatCellValue(value).toLowerCase().includes(lowercaseFilter)
      )
    );
  }, [normalizedData, filterText]);

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      // Handle null/undefined values
      if (aVal === null || aVal === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (bVal === null || bVal === undefined) return sortDirection === 'asc' ? 1 : -1;
      
      // Handle numeric values
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      // Handle string comparison
      const aStr = formatCellValue(aVal);
      const bStr = formatCellValue(bVal);
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage]);

  if (!isValid) {
    return (
      <div className="table-viewer-error">
        <p>Data is not suitable for table display</p>
        <small>Expected an array of objects with consistent properties</small>
      </div>
    );
  }

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const displayColumns = columns.filter(col => col !== '_index');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="table-viewer">
      <div className="table-header">
        <div className="table-info">
          <h4>Data Table</h4>
          <span className="table-stats">
            {sortedData.length} rows × {displayColumns.length} columns
          </span>
        </div>
        
        <div className="table-controls">
          <input
            type="text"
            placeholder="Filter data..."
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setCurrentPage(1);
            }}
            className="table-filter"
          />
          <button
            onClick={() => exportToCSV(sortedData, columns)}
            className="export-button"
            title="Export to CSV"
          >
            📊 Export CSV
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {displayColumns.map(column => (
                <th
                  key={column}
                  onClick={() => handleSort(column)}
                  className={`sortable ${sortColumn === column ? 'sorted' : ''}`}
                  title={`Sort by ${column}`}
                >
                  <span className="column-name">{column}</span>
                  <span className="sort-icon">{getSortIcon(column)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={String(row._index) || index}>
                {displayColumns.map(column => (
                  <td key={column} title={formatCellValue(row[column])}>
                    {formatCellValue(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="table-pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            ← Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};