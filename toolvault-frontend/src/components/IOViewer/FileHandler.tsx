import React, { useRef } from 'react';
import './FileHandler.css';

interface FileHandlerProps {
  onFileSelect?: (file: File) => void;
  onDataDownload?: (data: any, filename: string, format: string) => void;
  data?: any;
  filename?: string;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  showUpload?: boolean;
  showDownload?: boolean;
  downloadFormats?: Array<{ format: string; label: string; mimeType: string }>;
}

export const FileHandler: React.FC<FileHandlerProps> = ({
  onFileSelect,
  onDataDownload,
  data,
  filename = 'output',
  acceptedTypes = '*/*',
  maxSize = 10,
  showUpload = true,
  showDownload = true,
  downloadFormats = [
    { format: 'json', label: 'JSON', mimeType: 'application/json' },
    { format: 'csv', label: 'CSV', mimeType: 'text/csv' },
    { format: 'txt', label: 'Text', mimeType: 'text/plain' }
  ]
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    onFileSelect?.(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = (format: string, mimeType: string) => {
    if (!data) return;

    let content: string;
    let downloadFilename: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        downloadFilename = `${filename}.json`;
        break;
      case 'csv':
        content = convertToCSV(data);
        downloadFilename = `${filename}.csv`;
        break;
      case 'txt':
        content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        downloadFilename = `${filename}.txt`;
        break;
      default:
        content = JSON.stringify(data, null, 2);
        downloadFilename = `${filename}.${format}`;
    }

    // Create and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onDataDownload?.(data, downloadFilename, format);
  };

  const convertToCSV = (data: any): string => {
    if (!data) return '';

    // Handle arrays of objects
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return String(value || '');
          }).join(',')
        )
      ];
      return csvRows.join('\n');
    }

    // Handle simple arrays
    if (Array.isArray(data)) {
      return data.map(item => String(item)).join('\n');
    }

    // Handle objects
    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([key, value]) => `${key},${String(value)}`)
        .join('\n');
    }

    // Handle primitives
    return String(data);
  };

  return (
    <div className="file-handler">
      {showUpload && (
        <div className="upload-section">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button 
            className="upload-button"
            onClick={handleUploadClick}
            title={`Upload file (max ${maxSize}MB)`}
          >
            📁 Upload File
          </button>
          <span className="file-info">
            Max size: {maxSize}MB
          </span>
        </div>
      )}

      {showDownload && data && (
        <div className="download-section">
          <span className="download-label">Download as:</span>
          <div className="download-buttons">
            {downloadFormats.map(({ format, label, mimeType }) => (
              <button
                key={format}
                className="download-button"
                onClick={() => handleDownload(format, mimeType)}
                title={`Download as ${label}`}
              >
                💾 {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};