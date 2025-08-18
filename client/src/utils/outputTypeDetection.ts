/**
 * Intelligent output type detection utilities
 * Analyzes data structure and content to determine the most appropriate renderer
 */

import type { 
  OutputType, 
  OutputMetadata, 
  FeatureDetectionResult,
  ChartType 
} from '../types/output';

/**
 * Main function to detect output type from data and metadata
 */
export function detectOutputType(data: any, metadata?: OutputMetadata): OutputType {
  // Explicit type from metadata takes precedence
  if (metadata?.type) {
    return metadata.type;
  }

  // Run all detection algorithms and choose the highest confidence result
  const detectionResults: FeatureDetectionResult[] = [
    detectGeoJSON(data),
    detectTable(data),
    detectChart(data),
    detectImage(data),
    detectHTML(data),
    detectText(data),
    detectJSON(data),
  ].filter(result => result.confidence > 0);

  // Sort by confidence and return the highest
  detectionResults.sort((a, b) => b.confidence - a.confidence);
  
  return detectionResults.length > 0 ? detectionResults[0].type : 'generic';
}

/**
 * Detect GeoJSON format
 */
export function detectGeoJSON(data: any): FeatureDetectionResult {
  if (!data || typeof data !== 'object') {
    return { type: 'geojson', confidence: 0 };
  }

  let confidence = 0;

  // Check for GeoJSON structure
  if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
    confidence += 0.8;
    
    // Validate feature structure
    if (data.features.length > 0) {
      const validFeatures = data.features.filter((feature: any) =>
        feature.type === 'Feature' &&
        feature.geometry &&
        feature.geometry.type &&
        feature.geometry.coordinates
      );
      
      if (validFeatures.length > 0) {
        confidence += 0.2;
      }
    }
  } else if (
    data.type === 'Feature' &&
    data.geometry &&
    data.geometry.type &&
    data.geometry.coordinates
  ) {
    confidence = 0.9; // Single feature
  } else {
    // Check for nested GeoJSON in object properties (common for tool outputs)
    const possibleFeatures = [];
    
    // Check for common property names that might contain GeoJSON
    const geoJsonProperties = ['feature', 'buffered_geometry', 'geometry', 'result'];
    
    for (const propName of geoJsonProperties) {
      if (data[propName] && typeof data[propName] === 'object') {
        const nestedData = data[propName];
        
        // Check if nested data is a Feature
        if (nestedData.type === 'Feature' && nestedData.geometry && nestedData.geometry.coordinates) {
          possibleFeatures.push(nestedData);
          confidence = Math.max(confidence, 0.8);
        }
        // Check if nested data is a FeatureCollection
        else if (nestedData.type === 'FeatureCollection' && Array.isArray(nestedData.features)) {
          possibleFeatures.push(...nestedData.features);
          confidence = Math.max(confidence, 0.9);
        }
      }
    }
    
    // Also check all object values for GeoJSON-like structures
    if (confidence === 0) {
      for (const value of Object.values(data)) {
        if (value && typeof value === 'object') {
          if ((value as any).type === 'Feature' && (value as any).geometry && (value as any).geometry.coordinates) {
            confidence = Math.max(confidence, 0.7);
            break;
          }
          if ((value as any).type === 'FeatureCollection' && Array.isArray((value as any).features)) {
            confidence = Math.max(confidence, 0.8);
            break;
          }
        }
      }
    }
  }

  return {
    type: 'geojson',
    confidence: Math.min(confidence, 1),
    metadata: confidence > 0.5 ? {
      type: 'geojson',
      featureCount: data.features?.length || 1,
      geometryTypes: extractGeometryTypes(data),
    } : undefined,
  };
}

/**
 * Detect table/array data structure
 */
export function detectTable(data: any): FeatureDetectionResult {
  if (!Array.isArray(data) || data.length === 0) {
    return { type: 'table', confidence: 0 };
  }

  let confidence = 0;

  // Check if all items are objects with consistent structure
  const isObjectArray = data.every(item => 
    typeof item === 'object' && item !== null && !Array.isArray(item)
  );

  if (isObjectArray) {
    confidence += 0.6;

    // Check for consistent keys across objects
    const firstKeys = Object.keys(data[0]);
    const consistentStructure = data.every(item => {
      const keys = Object.keys(item);
      return keys.length === firstKeys.length &&
             keys.every(key => firstKeys.includes(key));
    });

    if (consistentStructure) {
      confidence += 0.3;
    }

    // Bonus for primitive value types (good for tables)
    const hasPrimitiveValues = firstKeys.some(key =>
      typeof data[0][key] === 'string' ||
      typeof data[0][key] === 'number' ||
      typeof data[0][key] === 'boolean'
    );

    if (hasPrimitiveValues) {
      confidence += 0.1;
    }
  }

  return {
    type: 'table',
    confidence: Math.min(confidence, 1),
    metadata: confidence > 0.5 ? {
      type: 'table',
      rowCount: data.length,
      columnCount: Object.keys(data[0] || {}).length,
      columns: Object.keys(data[0] || {}),
    } : undefined,
  };
}

/**
 * Detect chart data structure
 */
export function detectChart(data: any): FeatureDetectionResult {
  if (!data || typeof data !== 'object') {
    return { type: 'chart', confidence: 0 };
  }

  let confidence = 0;
  let chartType: ChartType = 'bar';

  // Check for Chart.js compatible structure
  if (data.labels && Array.isArray(data.labels) && data.datasets && Array.isArray(data.datasets)) {
    confidence += 0.7;

    // Validate dataset structure
    const validDatasets = data.datasets.every((dataset: any) =>
      dataset.data && Array.isArray(dataset.data) && dataset.data.length > 0
    );

    if (validDatasets) {
      confidence += 0.2;
    }

    // Infer chart type from data structure
    if (data.datasets[0]?.data?.every((item: any) => 
      typeof item === 'object' && 'x' in item && 'y' in item
    )) {
      chartType = 'scatter';
      confidence += 0.1;
    }
  }

  // Check for simple key-value pairs (can be converted to chart)
  else if (typeof data === 'object' && !Array.isArray(data)) {
    const entries = Object.entries(data);
    const hasNumericValues = entries.every(([, value]) => 
      typeof value === 'number' && !isNaN(value)
    );

    if (hasNumericValues && entries.length > 1) {
      confidence = 0.5;
      chartType = 'pie';
    }
  }

  return {
    type: 'chart',
    confidence: Math.min(confidence, 1),
    metadata: confidence > 0.3 ? {
      type: 'chart',
      chartType,
      datasetCount: data.datasets?.length || 1,
    } : undefined,
  };
}

/**
 * Detect image data (URL or base64)
 */
export function detectImage(data: any): FeatureDetectionResult {
  if (typeof data !== 'string') {
    return { type: 'image', confidence: 0 };
  }

  let confidence = 0;

  // Check for image URL patterns
  const imageUrlPattern = /\.(jpg|jpeg|png|gif|svg|webp|bmp|tiff)(\?.*)?$/i;
  const httpImagePattern = /^https?:\/\/.*\.(jpg|jpeg|png|gif|svg|webp|bmp|tiff)(\?.*)?$/i;
  
  if (httpImagePattern.test(data)) {
    confidence = 0.9;
  } else if (imageUrlPattern.test(data)) {
    confidence = 0.8;
  }

  // Check for base64 image data
  const base64ImagePattern = /^data:image\/(png|jpg|jpeg|gif|svg|webp);base64,/i;
  if (base64ImagePattern.test(data)) {
    confidence = 0.95;
  }

  return {
    type: 'image',
    confidence,
    metadata: confidence > 0.5 ? {
      type: 'image',
      mimeType: extractImageMimeType(data),
      isBase64: data.startsWith('data:'),
    } : undefined,
  };
}

/**
 * Detect text content
 */
export function detectText(data: any): FeatureDetectionResult {
  if (typeof data !== 'string') {
    return { type: 'text', confidence: 0 };
  }

  let confidence = 0.4; // Base confidence for any string
  let language = 'text';

  // Check for code patterns
  const codePatterns = {
    javascript: [/function\s+\w+\s*\(/i, /const\s+\w+\s*=/i, /=>\s*{/],
    python: [/def\s+\w+\s*\(/i, /import\s+\w+/i, /if\s+__name__\s*==\s*['""]__main__['"']/],
    json: [/^\s*[{\[]/i, /[}\]]\s*$/i],
    xml: [/<\?xml/i, /<\/\w+>/i],
    html: [/<!DOCTYPE\s+html/i, /<html/i, /<\/html>/i],
    css: [/\w+\s*:\s*[^;]+;/i, /\.\w+\s*{/i],
    sql: [/SELECT\s+.*\s+FROM\s+/i, /INSERT\s+INTO\s+/i, /UPDATE\s+.*\s+SET\s+/i],
  };

  // Test for specific programming languages
  for (const [lang, patterns] of Object.entries(codePatterns)) {
    const matches = patterns.filter(pattern => pattern.test(data)).length;
    if (matches > 0) {
      confidence += matches * 0.2;
      language = lang;
      break;
    }
  }

  // Check for structured text patterns
  if (data.includes('\n') && data.length > 100) {
    confidence += 0.1; // Multi-line text
  }

  return {
    type: 'text',
    confidence: Math.min(confidence, 1),
    metadata: {
      type: 'text',
      language,
      lineCount: data.split('\n').length,
      charCount: data.length,
    },
  };
}

/**
 * Detect HTML content
 */
export function detectHTML(data: any): FeatureDetectionResult {
  if (typeof data !== 'string') {
    return { type: 'html', confidence: 0 };
  }

  let confidence = 0;

  // Check for HTML tags
  const htmlTagRegex = /<[^>]*>/;
  if (htmlTagRegex.test(data)) {
    confidence += 0.5;
  }

  // Check for common HTML elements
  const commonHtmlTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'a', 'img', 'table', 'tr', 'td'];
  const foundTags = commonHtmlTags.filter(tag => {
    const tagRegex = new RegExp(`<${tag}\\b[^>]*>`, 'i');
    return tagRegex.test(data);
  });

  confidence += foundTags.length * 0.1;

  // Check for HTML document structure
  if (data.includes('<!DOCTYPE html>') || data.includes('<html>')) {
    confidence += 0.3;
  }

  // Check for style attributes (inline styles)
  if (/style\s*=\s*["'][^"']*["']/i.test(data)) {
    confidence += 0.2;
  }

  // Reduce confidence if it looks more like XML or other markup
  if (data.includes('<?xml')) {
    confidence -= 0.3;
  }

  return {
    type: 'html',
    confidence: Math.min(confidence, 1.0),
    metadata: {
      type: 'html',
      charCount: data.length,
      tagCount: (data.match(/<[^>]*>/g) || []).length,
      hasInlineStyles: /style\s*=/.test(data),
    },
  };
}

/**
 * Detect JSON object structure
 */
export function detectJSON(data: any): FeatureDetectionResult {
  if (typeof data !== 'object' || data === null) {
    return { type: 'json', confidence: 0 };
  }

  let confidence = 0.6; // Base confidence for any object

  // Check for complex nested structure
  const hasNestedObjects = Object.values(data).some(value =>
    typeof value === 'object' && value !== null
  );

  if (hasNestedObjects) {
    confidence += 0.2;
  }

  // Check for mixed data types
  const valueTypes = new Set(
    Object.values(data).map(value => typeof value)
  );

  if (valueTypes.size > 2) {
    confidence += 0.1;
  }

  // Reduce confidence if it looks more like table data
  if (Array.isArray(data)) {
    confidence -= 0.3;
  }

  return {
    type: 'json',
    confidence: Math.max(confidence, 0),
    metadata: {
      type: 'json',
      keyCount: Object.keys(data).length,
      depth: calculateObjectDepth(data),
      hasArrays: hasArrayValues(data),
    },
  };
}

/**
 * Helper function to extract geometry types from GeoJSON
 */
function extractGeometryTypes(geoJsonData: any): string[] {
  if (!geoJsonData.features) {
    return geoJsonData.geometry ? [geoJsonData.geometry.type] : [];
  }

  const types = new Set<string>();
  geoJsonData.features.forEach((feature: any) => {
    if (feature.geometry?.type) {
      types.add(feature.geometry.type);
    }
  });

  return Array.from(types);
}

/**
 * Helper function to extract MIME type from image string
 */
function extractImageMimeType(imageString: string): string {
  if (imageString.startsWith('data:image/')) {
    const match = imageString.match(/^data:image\/([^;]+)/);
    return match ? `image/${match[1]}` : 'image/unknown';
  }

  const extension = imageString.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
  };

  return mimeTypes[extension || ''] || 'image/unknown';
}

/**
 * Helper function to calculate object depth
 */
function calculateObjectDepth(obj: any, depth = 0): number {
  if (typeof obj !== 'object' || obj === null) {
    return depth;
  }

  if (Array.isArray(obj)) {
    return Math.max(depth, ...obj.map(item => calculateObjectDepth(item, depth + 1)));
  }

  const depths = Object.values(obj).map(value => calculateObjectDepth(value, depth + 1));
  return Math.max(depth, ...depths);
}

/**
 * Helper function to check for array values in object
 */
function hasArrayValues(obj: any): boolean {
  return Object.values(obj).some(value => Array.isArray(value));
}

/**
 * Check if data represents valid GeoJSON
 */
export function isGeoJSON(data: any): boolean {
  const result = detectGeoJSON(data);
  return result.confidence > 0.5;
}

/**
 * Check if data represents chart-compatible data
 */
export function isChartData(data: any): boolean {
  const result = detectChart(data);
  return result.confidence > 0.3;
}

/**
 * Check if string is an image URL
 */
export function isImageUrl(str: string): boolean {
  const result = detectImage(str);
  return result.confidence > 0.5;
}

/**
 * Check if string contains HTML content
 */
export function isHTML(str: string): boolean {
  const result = detectHTML(str);
  return result.confidence > 0.5;
}