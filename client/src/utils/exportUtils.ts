/**
 * Comprehensive export utilities for all output types
 */

import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import type { GridColDef } from '@mui/x-data-grid';
import type { ExportConfig, ExportFormat } from '../types/output';

export class OutputExporter {
  /**
   * Export GeoJSON map data in various formats
   */
  static async exportMap(
    mapData: GeoJSON.FeatureCollection, 
    format: 'geojson' | 'kml' | 'png' | 'csv',
    options?: { 
      filename?: string;
      includeProperties?: boolean;
      mapElement?: HTMLElement;
    }
  ): Promise<void> {
    const filename = options?.filename || 'map-data';

    switch (format) {
      case 'geojson':
        const geoJsonContent = JSON.stringify(mapData, null, 2);
        this.downloadFile(geoJsonContent, `${filename}.geojson`, 'application/geo+json');
        break;

      case 'kml':
        const kml = this.convertGeoJSONToKML(mapData);
        this.downloadFile(kml, `${filename}.kml`, 'application/vnd.google-earth.kml+xml');
        break;

      case 'png':
        if (options?.mapElement) {
          try {
            const canvas = await html2canvas(options.mapElement, {
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
            });
            canvas.toBlob(blob => {
              if (blob) {
                this.downloadBlob(blob, `${filename}.png`);
              }
            }, 'image/png');
          } catch (error) {
            console.error('Error exporting map as PNG:', error);
            throw new Error('Failed to export map as image');
          }
        }
        break;

      case 'csv':
        const csvData = this.convertGeoJSONToCSV(mapData, options?.includeProperties !== false);
        this.downloadFile(csvData, `${filename}.csv`, 'text/csv');
        break;
    }
  }

  /**
   * Export table data in various formats
   */
  static exportTable(
    data: any[], 
    columns: GridColDef[], 
    format: 'csv' | 'excel' | 'json' | 'tsv',
    options?: {
      filename?: string;
      includeHeaders?: boolean;
      selectedRows?: any[];
    }
  ): void {
    const filename = options?.filename || 'table-data';
    const exportData = options?.selectedRows || data;
    const includeHeaders = options?.includeHeaders !== false;

    switch (format) {
      case 'csv':
        const csv = this.convertToCSV(exportData, columns, includeHeaders);
        this.downloadFile(csv, `${filename}.csv`, 'text/csv');
        break;

      case 'tsv':
        const tsv = this.convertToTSV(exportData, columns, includeHeaders);
        this.downloadFile(tsv, `${filename}.tsv`, 'text/tab-separated-values');
        break;

      case 'excel':
        this.exportToExcel(exportData, columns, filename, includeHeaders);
        break;

      case 'json':
        const jsonContent = JSON.stringify(exportData, null, 2);
        this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
        break;
    }
  }

  /**
   * Export chart as image or data
   */
  static async exportChart(
    chartRef: React.RefObject<any>,
    data: any,
    format: 'png' | 'jpg' | 'svg' | 'json' | 'csv',
    options?: {
      filename?: string;
      quality?: number;
      width?: number;
      height?: number;
    }
  ): Promise<void> {
    const filename = options?.filename || 'chart';
    const quality = options?.quality || 0.9;

    switch (format) {
      case 'png':
      case 'jpg':
        if (chartRef.current?.canvas) {
          const canvas = chartRef.current.canvas;
          const url = canvas.toDataURL(`image/${format}`, quality);
          this.downloadDataURL(url, `${filename}.${format}`);
        }
        break;

      case 'svg':
        // SVG export would require additional chart.js plugin
        throw new Error('SVG export not implemented for Chart.js');

      case 'json':
        const chartJson = JSON.stringify(data, null, 2);
        this.downloadFile(chartJson, `${filename}.json`, 'application/json');
        break;

      case 'csv':
        const chartCsv = this.convertChartDataToCSV(data);
        this.downloadFile(chartCsv, `${filename}.csv`, 'text/csv');
        break;
    }
  }

  /**
   * Export image with various options
   */
  static async exportImage(
    src: string,
    format: 'original' | 'png' | 'jpg',
    options?: {
      filename?: string;
      quality?: number;
      maxWidth?: number;
      maxHeight?: number;
    }
  ): Promise<void> {
    const filename = options?.filename || 'image';

    if (format === 'original') {
      // Download original image
      try {
        const response = await fetch(src);
        const blob = await response.blob();
        const extension = this.getImageExtension(src) || 'png';
        this.downloadBlob(blob, `${filename}.${extension}`);
      } catch (error) {
        // Fallback to direct link download
        this.downloadDataURL(src, filename);
      }
    } else {
      // Convert image format
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const { width, height } = this.calculateImageDimensions(
          img.width, 
          img.height, 
          options?.maxWidth, 
          options?.maxHeight
        );

        canvas.width = width;
        canvas.height = height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(blob => {
            if (blob) {
              this.downloadBlob(blob, `${filename}.${format}`);
            }
          }, `image/${format}`, options?.quality || 0.9);
        }
      };
      
      img.src = src;
    }
  }

  /**
   * Export text content
   */
  static exportText(
    content: string,
    format: 'txt' | 'md' | 'html' | 'pdf',
    options?: {
      filename?: string;
      language?: string;
      includeLineNumbers?: boolean;
    }
  ): void {
    const filename = options?.filename || 'text-content';
    const language = options?.language || 'text';

    switch (format) {
      case 'txt':
        this.downloadFile(content, `${filename}.txt`, 'text/plain');
        break;

      case 'md':
        const mdContent = this.wrapInCodeBlock(content, language);
        this.downloadFile(mdContent, `${filename}.md`, 'text/markdown');
        break;

      case 'html':
        const htmlContent = this.convertTextToHTML(content, language, options?.includeLineNumbers);
        this.downloadFile(htmlContent, `${filename}.html`, 'text/html');
        break;

      case 'pdf':
        // PDF generation would require additional library like jsPDF
        throw new Error('PDF export not implemented');
    }
  }

  /**
   * Export JSON data
   */
  static exportJSON(
    data: any,
    format: 'json' | 'js' | 'ts' | 'yaml',
    options?: {
      filename?: string;
      pretty?: boolean;
      minify?: boolean;
    }
  ): void {
    const filename = options?.filename || 'data';
    const pretty = options?.pretty !== false;

    switch (format) {
      case 'json':
        const jsonContent = pretty 
          ? JSON.stringify(data, null, 2)
          : JSON.stringify(data);
        this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
        break;

      case 'js':
        const jsContent = `export const data = ${JSON.stringify(data, null, pretty ? 2 : 0)};`;
        this.downloadFile(jsContent, `${filename}.js`, 'application/javascript');
        break;

      case 'ts':
        const tsContent = `export const data: any = ${JSON.stringify(data, null, pretty ? 2 : 0)};`;
        this.downloadFile(tsContent, `${filename}.ts`, 'application/typescript');
        break;

      case 'yaml':
        // YAML conversion would require additional library
        throw new Error('YAML export not implemented');
    }
  }

  // Private utility methods

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, filename);
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private static downloadDataURL(dataURL: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private static convertToCSV(data: any[], columns: GridColDef[], includeHeaders = true): string {
    const headers = columns.map(col => col.headerName || col.field);
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col.field];
        const stringValue = value === null || value === undefined ? '' : String(value);
        // Escape CSV special characters
        return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
          ? `"${stringValue.replace(/"/g, '""')}"` 
          : stringValue;
      })
    );

    const csvContent = includeHeaders 
      ? [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
      : rows.map(row => row.join(',')).join('\n');

    return csvContent;
  }

  private static convertToTSV(data: any[], columns: GridColDef[], includeHeaders = true): string {
    const headers = columns.map(col => col.headerName || col.field);
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col.field];
        return value === null || value === undefined ? '' : String(value).replace(/\t/g, '    ');
      })
    );

    const tsvContent = includeHeaders 
      ? [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n')
      : rows.map(row => row.join('\t')).join('\n');

    return tsvContent;
  }

  private static exportToExcel(data: any[], columns: GridColDef[], filename: string, includeHeaders = true): void {
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const excelData = data.map(row => {
      const excelRow: any = {};
      columns.forEach(col => {
        const header = col.headerName || col.field;
        excelRow[header] = row[col.field];
      });
      return excelRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData, { 
      header: includeHeaders ? columns.map(col => col.headerName || col.field) : undefined 
    });

    // Auto-size columns
    const colWidths = columns.map(col => ({
      width: Math.max(10, Math.min(50, (col.headerName || col.field).length + 5))
    }));
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  private static convertGeoJSONToKML(geoJsonData: GeoJSON.FeatureCollection): string {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Exported GeoJSON Data</name>`;

    geoJsonData.features.forEach((feature, index) => {
      const properties = feature.properties || {};
      const name = properties.name || `Feature ${index + 1}`;
      
      kml += `
    <Placemark>
      <name>${this.escapeXML(name)}</name>`;

      if (properties.description) {
        kml += `
      <description>${this.escapeXML(properties.description)}</description>`;
      }

      // Convert geometry to KML format (simplified)
      if (feature.geometry.type === 'Point') {
        const coords = feature.geometry.coordinates as [number, number];
        kml += `
      <Point>
        <coordinates>${coords[0]},${coords[1]}</coordinates>
      </Point>`;
      }

      kml += `
    </Placemark>`;
    });

    kml += `
  </Document>
</kml>`;

    return kml;
  }

  private static convertGeoJSONToCSV(geoJsonData: GeoJSON.FeatureCollection, includeProperties = true): string {
    const headers = ['type', 'geometry_type', 'longitude', 'latitude'];
    const propertyKeys = new Set<string>();

    // Collect all property keys
    if (includeProperties) {
      geoJsonData.features.forEach(feature => {
        if (feature.properties) {
          Object.keys(feature.properties).forEach(key => propertyKeys.add(key));
        }
      });
      headers.push(...Array.from(propertyKeys));
    }

    const rows = geoJsonData.features.map(feature => {
      const row = [
        feature.type,
        feature.geometry.type,
        '', // longitude
        '', // latitude
      ];

      // Extract coordinates (simplified for Point geometry)
      if (feature.geometry.type === 'Point') {
        const coords = feature.geometry.coordinates as [number, number];
        row[2] = String(coords[0]); // longitude
        row[3] = String(coords[1]); // latitude
      }

      // Add properties
      if (includeProperties) {
        Array.from(propertyKeys).forEach(key => {
          const value = feature.properties?.[key];
          row.push(value === null || value === undefined ? '' : String(value));
        });
      }

      return row;
    });

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private static convertChartDataToCSV(chartData: any): string {
    if (!chartData.labels || !chartData.datasets) {
      return 'No chart data available';
    }

    const headers = ['Label', ...chartData.datasets.map((dataset: any) => dataset.label || 'Dataset')];
    const rows = chartData.labels.map((label: string, index: number) => {
      const row = [label];
      chartData.datasets.forEach((dataset: any) => {
        const value = dataset.data[index];
        row.push(value === null || value === undefined ? '' : String(value));
      });
      return row;
    });

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private static wrapInCodeBlock(content: string, language: string): string {
    return `\`\`\`${language}\n${content}\n\`\`\``;
  }

  private static convertTextToHTML(content: string, language: string, includeLineNumbers = false): string {
    const escapedContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const lines = escapedContent.split('\n');
    const numberedLines = includeLineNumbers
      ? lines.map((line, index) => `<span class="line-number">${index + 1}</span>${line}`).join('\n')
      : escapedContent;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Exported Text</title>
  <style>
    body { font-family: monospace; margin: 20px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .line-number { color: #999; margin-right: 10px; user-select: none; }
  </style>
</head>
<body>
  <pre><code class="language-${language}">${numberedLines}</code></pre>
</body>
</html>`;
  }

  private static escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private static getImageExtension(url: string): string | null {
    const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return match ? match[1].toLowerCase() : null;
  }

  private static calculateImageDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth?: number, 
    maxHeight?: number
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    if (maxWidth && width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (maxHeight && height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }
}

export default OutputExporter;