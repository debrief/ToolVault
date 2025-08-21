import React, { useState } from 'react';
import './SampleDataSelector.css';

interface SampleDataItem {
  id: string;
  name: string;
  description: string;
  url: string;
  type: 'geojson' | 'json' | 'csv' | 'txt';
  category: string;
}

interface SampleDataSelectorProps {
  onDataSelect: (data: unknown, filename: string) => void;
}

const SAMPLE_DATA: SampleDataItem[] = [
  {
    id: 'sample-track',
    name: 'GPS Track (LineString)',
    description: 'Sample GPS track for transformation and analysis tools',
    url: '/examples/sample-track.geojson',
    type: 'geojson',
    category: 'Geographic Data'
  },
  {
    id: 'sample-features',
    name: 'Mixed Features',
    description: 'Points, lines, and polygons for spatial tool testing',
    url: '/examples/sample-features.geojson',
    type: 'geojson',
    category: 'Geographic Data'
  },
  {
    id: 'time-series-data',
    name: 'Speed Time Series',
    description: 'Time-based speed data for analysis tools',
    url: '/examples/time-series-data.json',
    type: 'json',
    category: 'Time Series'
  }
];

const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'Geographic Data':
      return '🗺️';
    case 'Time Series':
      return '📈';
    case 'Tabular Data':
      return '📊';
    default:
      return '📄';
  }
};

export const SampleDataSelector: React.FC<SampleDataSelectorProps> = ({ onDataSelect }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSampleData = async (item: SampleDataItem) => {
    setLoading(item.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(item.url);
      
      if (!response.ok) {
        throw new Error(`Failed to load ${item.name}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      let data: unknown;

      if (contentType?.includes('application/json') || item.type === 'json' || item.type === 'geojson') {
        data = await response.json();
      } else if (item.type === 'csv') {
        const csvText = await response.text();
        data = parseCsv(csvText);
      } else {
        data = await response.text();
      }

      onDataSelect(data, item.name);
      setSuccess(`Loaded ${item.name} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const parseCsv = (csvText: string): Record<string, string>[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      return row;
    });
  };

  const groupedData = SAMPLE_DATA.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SampleDataItem[]>);

  return (
    <div className="sample-data-selector">
      <div className="selector-header">
        <h4>📦 Load Sample Data</h4>
        <p>Choose from pre-loaded sample data to test Phase 0 tools</p>
      </div>

      {error && (
        <div className="message error">
          <span className="message-icon">❌</span>
          {error}
        </div>
      )}

      {success && (
        <div className="message success">
          <span className="message-icon">✅</span>
          {success}
        </div>
      )}

      <div className="sample-categories">
        {Object.entries(groupedData).map(([category, items]) => (
          <div key={category} className="category-section">
            <h5 className="category-title">
              {getCategoryIcon(category)} {category}
            </h5>
            <div className="sample-items">
              {items.map((item) => (
                <div key={item.id} className="sample-item">
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-description">{item.description}</div>
                    <div className="item-type">.{item.type}</div>
                  </div>
                  <button
                    className={`load-button ${loading === item.id ? 'loading' : ''}`}
                    onClick={() => loadSampleData(item)}
                    disabled={loading === item.id}
                  >
                    {loading === item.id ? (
                      <>
                        <span className="spinner"></span>
                        Loading...
                      </>
                    ) : (
                      '📥 Load'
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="selector-footer">
        <p className="note">
          💡 These sample files are designed to work with Phase 0 JavaScript tools.
          Use them to test transformation, analysis, and visualization features.
        </p>
      </div>
    </div>
  );
};