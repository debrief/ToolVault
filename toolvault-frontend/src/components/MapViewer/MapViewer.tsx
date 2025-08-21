import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Feature, Geometry, GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';
import './MapViewer.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewerProps {
  data: unknown;
  height?: number;
}

interface GeoJSONData {
  type: string;
  features?: Feature[];
  geometry?: Geometry;
  coordinates?: unknown[];
  properties?: Record<string, unknown>;
}

// Component to fit map bounds to GeoJSON data
const FitBounds: React.FC<{ data: GeoJSONData }> = ({ data }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!data) return;
    
    try {
      const geoJsonLayer = L.geoJSON(data as GeoJsonObject);
      const bounds = geoJsonLayer.getBounds();
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch (error) {
      console.error('Error fitting bounds:', error);
    }
  }, [data, map]);
  
  return null;
};

// Style function for different geometry types
const getFeatureStyle = (feature?: Feature): L.PathOptions => {
  if (!feature) {
    return {
      color: '#95a5a6',
      weight: 2,
      opacity: 0.8,
    };
  }
  
  const geometryType = feature.geometry?.type;
  
  switch (geometryType) {
    case 'Point':
      return {
        color: '#ff6b6b',
        fillOpacity: 0.8,
      };
    case 'LineString':
    case 'MultiLineString':
      return {
        color: '#4ecdc4',
        weight: 3,
        opacity: 0.8,
      };
    case 'Polygon':
    case 'MultiPolygon':
      return {
        color: '#45b7d1',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.3,
      };
    default:
      return {
        color: '#95a5a6',
        weight: 2,
        opacity: 0.8,
      };
  }
};

// Popup content for features
const onEachFeature = (feature: Feature, layer: L.Layer) => {
  if (feature.properties) {
    const properties = feature.properties;
    const geometryType = feature.geometry?.type;
    
    let popupContent = `<div class="leaflet-popup-content-wrapper">`;
    popupContent += `<div class="leaflet-popup-content">`;
    popupContent += `<h4>Feature Details</h4>`;
    popupContent += `<p><strong>Type:</strong> ${geometryType}</p>`;
    
    // Show relevant properties
    Object.entries(properties).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        popupContent += `<p><strong>${key}:</strong> ${String(value)}</p>`;
      }
    });
    
    // Show coordinates summary
    if (feature.geometry && 'coordinates' in feature.geometry) {
      const coords = (feature.geometry as { coordinates: number[] | number[][] | number[][][] }).coordinates;
      if (geometryType === 'Point' && Array.isArray(coords) && coords.length >= 2) {
        const [lng, lat] = coords as number[];
        popupContent += `<p><strong>Coordinates:</strong> [${lat.toFixed(6)}, ${lng.toFixed(6)}]</p>`;
      } else if (geometryType === 'LineString' && Array.isArray(coords)) {
        popupContent += `<p><strong>Points:</strong> ${coords.length}</p>`;
      } else if (geometryType === 'Polygon' && Array.isArray(coords) && Array.isArray(coords[0])) {
        popupContent += `<p><strong>Vertices:</strong> ${coords[0].length}</p>`;
      }
    }
    
    popupContent += `</div></div>`;
    layer.bindPopup(popupContent);
  }
};

const isValidGeoJSON = (data: unknown): data is GeoJSONData => {
  if (!data || typeof data !== 'object') return false;
  
  const geoData = data as GeoJSONData;
  const validTypes = ['Feature', 'FeatureCollection', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'];
  
  return typeof geoData.type === 'string' && validTypes.includes(geoData.type);
};

export const MapViewer: React.FC<MapViewerProps> = ({ data, height = 400 }) => {
  const mapRef = useRef<L.Map | null>(null);
  
  if (!isValidGeoJSON(data)) {
    return (
      <div className="map-viewer-error">
        <p>Invalid or unsupported GeoJSON data</p>
        <small>Only valid GeoJSON Features, FeatureCollections, and geometries are supported</small>
      </div>
    );
  }
  
  const geoJsonData = data as GeoJSONData;
  
  return (
    <div className="map-viewer" style={{ height }}>
      <MapContainer
        center={[40.7128, -74.0060]} // Default to NYC
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <GeoJSON
          key={JSON.stringify(geoJsonData)} // Force re-render on data change
          data={geoJsonData as GeoJsonObject}
          style={getFeatureStyle}
          onEachFeature={onEachFeature}
          pointToLayer={(feature, latlng) => {
            const style = getFeatureStyle(feature);
            return L.circleMarker(latlng, {
              ...style,
              radius: 8,
            });
          }}
        />
        
        <FitBounds data={geoJsonData} />
      </MapContainer>
    </div>
  );
};