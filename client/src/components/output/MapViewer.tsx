/**
 * MapViewer component for rendering interactive GeoJSON maps using Leaflet
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  ButtonGroup, 
  Button, 
  Paper, 
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert
} from '@mui/material';
import {
  ZoomOutMap as ZoomOutMapIcon,
  Layers as LayersIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapViewerProps } from '../../types/output';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map bounds fitting
const MapBoundsController: React.FC<{ data: GeoJSON.FeatureCollection }> = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (data.features.length > 0) {
      const geoJsonLayer = L.geoJSON(data);
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [data, map]);

  return null;
};

// Feature popup component
const FeaturePopup: React.FC<{
  feature: GeoJSON.Feature;
  onSelect: () => void;
}> = ({ feature, onSelect }) => {
  const properties = feature.properties || {};
  
  return (
    <Box sx={{ minWidth: 200, maxWidth: 300 }}>
      <Typography variant="h6" gutterBottom>
        Feature Details
      </Typography>
      <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
        {Object.entries(properties).map(([key, value]) => (
          <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
            <strong>{key}:</strong> {String(value)}
          </Typography>
        ))}
      </Box>
      <Button 
        size="small" 
        onClick={onSelect}
        sx={{ mt: 1 }}
        startIcon={<InfoIcon />}
      >
        View Details
      </Button>
    </Box>
  );
};

// Feature details panel
const FeatureDetailsPanel: React.FC<{
  feature: GeoJSON.Feature;
  onClose: () => void;
}> = ({ feature, onClose }) => {
  const properties = feature.properties || {};
  const geometry = feature.geometry;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {geometry.type} Feature
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Typography variant="subtitle2" gutterBottom>
        Properties:
      </Typography>
      <Box sx={{ mb: 2 }}>
        {Object.keys(properties).length > 0 ? (
          Object.entries(properties).map(([key, value]) => (
            <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
              <strong>{key}:</strong> {String(value)}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No properties available
          </Typography>
        )}
      </Box>

      <Typography variant="subtitle2" gutterBottom>
        Geometry:
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Type: {geometry.type}
      </Typography>
      
      {geometry.type === 'Point' && (
        <Typography variant="body2" color="text.secondary">
          Coordinates: [{(geometry as GeoJSON.Point).coordinates.join(', ')}]
        </Typography>
      )}
    </Box>
  );
};

export const MapViewer: React.FC<MapViewerProps> = ({
  data,
  height = 400,
  width = '100%',
  interactive = true,
  showControls = true,
  center,
  zoom = 10,
  exportable = true
}) => {
  const [selectedFeature, setSelectedFeature] = useState<GeoJSON.Feature | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Validate GeoJSON data
  useEffect(() => {
    if (!data || !data.features || !Array.isArray(data.features)) {
      setError('Invalid GeoJSON data provided');
      return;
    }

    if (data.features.length === 0) {
      setError('No features found in GeoJSON data');
      return;
    }

    setError(null);
  }, [data]);

  const onEachFeature = useCallback((feature: GeoJSON.Feature, layer: L.Layer) => {
    // Bind popup with feature information
    if (feature.properties && Object.keys(feature.properties).length > 0) {
      const popupContent = document.createElement('div');
      
      // We'll create a React portal for the popup content
      const popup = L.popup({ 
        maxWidth: 300,
        closeButton: true 
      }).setContent(popupContent);
      
      layer.bindPopup(popup);
    }

    // Add hover effects
    layer.on({
      mouseover: (e) => {
        const target = e.target;
        if (target.setStyle) {
          target.setStyle({
            weight: 3,
            color: '#666',
            fillOpacity: 0.7
          });
        }
      },
      mouseout: (e) => {
        const target = e.target;
        if (target.setStyle) {
          target.setStyle({
            weight: 2,
            color: '#3388ff',
            fillOpacity: 0.2
          });
        }
      },
      click: () => {
        setSelectedFeature(feature);
      }
    });
  }, []);

  const handleZoomToFit = useCallback(() => {
    if (mapRef.current && data.features.length > 0) {
      const geoJsonLayer = L.geoJSON(data);
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [data]);

  const handleExportMap = useCallback(async () => {
    if (!exportable) return;

    try {
      // Export as GeoJSON
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/geo+json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'map-data.geojson';
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting map:', error);
    }
  }, [data, exportable]);

  const renderMap = (isFullscreenMode = false) => (
    <MapContainer
      center={center || [0, 0]}
      zoom={zoom}
      style={{ 
        height: isFullscreenMode ? '70vh' : height, 
        width: '100%' 
      }}
      scrollWheelZoom={interactive}
      attributionControl={showControls}
      ref={(mapInstance) => {
        if (mapInstance) {
          mapRef.current = mapInstance;
        }
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      
      {data && (
        <>
          <GeoJSON
            data={data}
            onEachFeature={onEachFeature}
            style={() => ({
              color: '#3388ff',
              weight: 2,
              fillOpacity: 0.2,
              opacity: 0.8
            })}
          />
          <MapBoundsController data={data} />
        </>
      )}
    </MapContainer>
  );

  if (error) {
    return (
      <Box sx={{ height, width, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Map Rendering Error
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height, width, position: 'relative' }}>
      {/* Map Controls */}
      {showControls && (
        <Box sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 1
        }}>
          <ButtonGroup orientation="vertical" variant="contained" size="small">
            <Tooltip title="Zoom to fit all features">
              <Button onClick={handleZoomToFit}>
                <ZoomOutMapIcon />
              </Button>
            </Tooltip>
            
            <Tooltip title="Toggle fullscreen">
              <Button onClick={() => setIsFullscreen(true)}>
                <FullscreenIcon />
              </Button>
            </Tooltip>
            
            {exportable && (
              <Tooltip title="Export as GeoJSON">
                <Button onClick={handleExportMap}>
                  <DownloadIcon />
                </Button>
              </Tooltip>
            )}
          </ButtonGroup>
        </Box>
      )}

      {/* Map Content */}
      {renderMap()}

      {/* Feature Details Panel */}
      {selectedFeature && (
        <Paper 
          sx={{ 
            position: 'absolute', 
            bottom: 10, 
            left: 10, 
            right: 10, 
            maxHeight: 200, 
            overflow: 'auto',
            zIndex: 1000
          }}
          elevation={3}
        >
          <FeatureDetailsPanel 
            feature={selectedFeature}
            onClose={() => setSelectedFeature(null)}
          />
        </Paper>
      )}

      {/* Map Statistics */}
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 1,
        padding: 1
      }}>
        <Typography variant="caption" color="text.secondary">
          Features: {data.features?.length || 0}
        </Typography>
      </Box>

      {/* Fullscreen Modal */}
      <Dialog
        open={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Map Viewer
          <IconButton onClick={() => setIsFullscreen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          {renderMap(true)}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MapViewer;