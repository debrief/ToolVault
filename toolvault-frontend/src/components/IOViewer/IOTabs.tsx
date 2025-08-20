import React, { useState } from 'react';
import { JSONRenderer } from './JSONRenderer';
import { FileHandler } from './FileHandler';
import './IOTabs.css';

interface IOTabsProps {
  data: any;
  title?: string;
  showRaw?: boolean;
  showPreview?: boolean;
  showDownload?: boolean;
  filename?: string;
  renderPreview?: (data: any) => React.ReactNode;
  onFileSelect?: (file: File) => void;
}

export const IOTabs: React.FC<IOTabsProps> = ({
  data,
  title,
  showRaw = true,
  showPreview = true,
  showDownload = true,
  filename = 'data',
  renderPreview,
  onFileSelect
}) => {
  const [activeTab, setActiveTab] = useState<'raw' | 'preview' | 'download'>(() => {
    if (showPreview) return 'preview';
    if (showRaw) return 'raw';
    return 'download';
  });

  const tabs = [
    { id: 'preview' as const, label: 'Preview', show: showPreview },
    { id: 'raw' as const, label: 'Raw Data', show: showRaw },
    { id: 'download' as const, label: 'Download', show: showDownload }
  ].filter(tab => tab.show);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preview':
        return (
          <div className="tab-content">
            {renderPreview ? (
              <div className="custom-preview">
                {renderPreview(data)}
              </div>
            ) : (
              <div className="default-preview">
                {renderDefaultPreview(data)}
              </div>
            )}
          </div>
        );

      case 'raw':
        return (
          <div className="tab-content">
            <JSONRenderer data={data} />
          </div>
        );

      case 'download':
        return (
          <div className="tab-content">
            <FileHandler
              data={data}
              filename={filename}
              showUpload={!!onFileSelect}
              showDownload={!!data}
              onFileSelect={onFileSelect}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderDefaultPreview = (data: any) => {
    if (data === null || data === undefined) {
      return <div className="empty-data">No data</div>;
    }

    // Handle GeoJSON data
    if (isGeoJSON(data)) {
      return (
        <div className="geojson-preview">
          <div className="preview-header">
            <h4>GeoJSON Data</h4>
            <span className="data-type">{data.type}</span>
          </div>
          <div className="preview-summary">
            {data.type === 'FeatureCollection' && (
              <p>Features: {data.features?.length || 0}</p>
            )}
            {data.type === 'Feature' && data.geometry && (
              <p>Geometry: {data.geometry.type}</p>
            )}
            {data.coordinates && (
              <p>Coordinates: {Array.isArray(data.coordinates) ? data.coordinates.length : 'Single point'}</p>
            )}
          </div>
          <div className="preview-note">
            🗺️ Map visualization will be available in a future release
          </div>
        </div>
      );
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return (
        <div className="array-preview">
          <div className="preview-header">
            <h4>Array Data</h4>
            <span className="data-type">Array ({data.length} items)</span>
          </div>
          <div className="array-sample">
            {data.slice(0, 3).map((item, index) => (
              <div key={index} className="array-item">
                {typeof item === 'object' ? JSON.stringify(item) : String(item)}
              </div>
            ))}
            {data.length > 3 && (
              <div className="array-more">... and {data.length - 3} more items</div>
            )}
          </div>
        </div>
      );
    }

    // Handle objects
    if (typeof data === 'object') {
      const entries = Object.entries(data).slice(0, 5);
      return (
        <div className="object-preview">
          <div className="preview-header">
            <h4>Object Data</h4>
            <span className="data-type">Object ({Object.keys(data).length} properties)</span>
          </div>
          <div className="object-properties">
            {entries.map(([key, value]) => (
              <div key={key} className="property-item">
                <span className="property-key">{key}:</span>
                <span className="property-value">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
            {Object.keys(data).length > 5 && (
              <div className="properties-more">... and {Object.keys(data).length - 5} more properties</div>
            )}
          </div>
        </div>
      );
    }

    // Handle primitives
    return (
      <div className="primitive-preview">
        <div className="preview-header">
          <h4>Data</h4>
          <span className="data-type">{typeof data}</span>
        </div>
        <div className="primitive-value">{String(data)}</div>
      </div>
    );
  };

  const isGeoJSON = (data: any): boolean => {
    return data && typeof data === 'object' && 
           ['Feature', 'FeatureCollection', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'].includes(data.type);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="io-tabs">
      {title && <h3 className="io-tabs-title">{title}</h3>}
      
      <div className="tabs-header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
};