import React, { useCallback, useState } from 'react';
import './FileUploader.css';

interface FileUploaderProps {
  onFileSelect: (file: File, content: string) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}


const DEFAULT_ACCEPTED_FORMATS = [
  '.json',
  '.geojson',
  '.csv',
  '.txt',
  '.rep'
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const isValidFileType = (file: File, acceptedFormats: string[]): boolean => {
  const fileName = file.name.toLowerCase();
  return acceptedFormats.some(format => 
    fileName.endsWith(format.toLowerCase())
  );
};

const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Failed to read file content'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  maxSizeMB = 10
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);


  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    setError(null);
    setSuccess(null);
    setIsProcessing(true);

    try {
      // Validate file type
      if (!isValidFileType(file, acceptedFormats)) {
        throw new Error(`Unsupported file type. Accepted formats: ${acceptedFormats.join(', ')}`);
      }

      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new Error(`File size exceeds ${maxSizeMB}MB limit. Current size: ${formatFileSize(file.size)}`);
      }

      // Read file content
      const content = await readFileContent(file);
      
      // Validate content based on file type
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.json') || fileName.endsWith('.geojson')) {
        try {
          JSON.parse(content);
        } catch {
          throw new Error('Invalid JSON format');
        }
      }

      onFileSelect(file, content);
      setSuccess(`Successfully loaded ${file.name} (${formatFileSize(file.size)})`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [acceptedFormats, maxSizeMB, onFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    handleFileSelect(event.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  }, [handleFileSelect]);

  return (
    <div className="file-uploader">
      <div
        className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isProcessing ? (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <p>Processing file...</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <h4>Drop a file here or click to browse</h4>
            <p>
              Supported formats: {acceptedFormats.join(', ')}
              <br />
              Maximum size: {maxSizeMB}MB
            </p>
            <input
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={handleFileInputChange}
              className="file-input"
              disabled={isProcessing}
            />
          </>
        )}
      </div>

      {error && (
        <div className="file-message error">
          <span className="message-icon">❌</span>
          {error}
        </div>
      )}

      {success && (
        <div className="file-message success">
          <span className="message-icon">✅</span>
          {success}
        </div>
      )}

      <div className="supported-formats">
        <h5>Supported File Types:</h5>
        <ul>
          <li><strong>.json/.geojson</strong> - Geographic and structured data</li>
          <li><strong>.csv</strong> - Comma-separated values</li>
          <li><strong>.txt</strong> - Plain text data</li>
          <li><strong>.rep</strong> - REP track format</li>
        </ul>
      </div>
    </div>
  );
};