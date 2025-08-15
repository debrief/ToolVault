# APM Task Assignment: Advanced Output Rendering

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 4, Task 4.3** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Implement production-grade output viewers for different data types including LeafletJS map rendering, interactive tables, charts, and universal output rendering capabilities.

**Prerequisites:** Tasks 4.1 and 4.2 completed - Mock backend service and enhanced search/filtering should be operational.

## 2. Detailed Action Steps

1. **Implement LeafletJS Map Rendering:**
   - Set up React-Leaflet for GeoJSON visualization:
     ```typescript
     // src/components/output/MapViewer.tsx
     import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
     import L from 'leaflet';
     import 'leaflet/dist/leaflet.css';
     
     export interface MapViewerProps {
       data: GeoJSON.FeatureCollection;
       height?: number;
       width?: string;
       interactive?: boolean;
       showControls?: boolean;
     }
     
     export function MapViewer({ 
       data, 
       height = 400, 
       width = '100%',
       interactive = true,
       showControls = true 
     }: MapViewerProps) {
       const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
       const [selectedFeature, setSelectedFeature] = useState<GeoJSON.Feature | null>(null);
       
       useEffect(() => {
         if (data.features.length > 0) {
           const group = L.geoJSON(data);
           setBounds(group.getBounds());
         }
       }, [data]);
       
       const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
         if (feature.properties) {
           layer.bindPopup(
             <FeaturePopup 
               feature={feature} 
               onSelect={() => setSelectedFeature(feature)}
             />
           );
         }
         
         layer.on({
           mouseover: (e) => {
             const layer = e.target;
             layer.setStyle({ weight: 3, color: '#666', fillOpacity: 0.7 });
           },
           mouseout: (e) => {
             const layer = e.target;
             layer.setStyle({ weight: 2, color: '#3388ff', fillOpacity: 0.2 });
           },
         });
       };
       
       return (
         <Box sx={{ height, width, position: 'relative' }}>
           <MapContainer
             bounds={bounds || undefined}
             style={{ height: '100%', width: '100%' }}
             scrollWheelZoom={interactive}
             attributionControl={showControls}
           >
             <TileLayer
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
               attribution="&copy; OpenStreetMap contributors"
             />
             
             {data && (
               <GeoJSON
                 data={data}
                 onEachFeature={onEachFeature}
                 style={() => ({
                   color: '#3388ff',
                   weight: 2,
                   fillOpacity: 0.2,
                 })}
               />
             )}
           </MapContainer>
           
           {/* Map Controls */}
           {showControls && (
             <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
               <ButtonGroup orientation="vertical" variant="contained" size="small">
                 <Button onClick={() => {/* Zoom to fit */}}>
                   <ZoomOutMapIcon />
                 </Button>
                 <Button onClick={() => {/* Toggle layers */}}>
                   <LayersIcon />
                 </Button>
                 <Button onClick={() => {/* Export map */}}>
                   <DownloadIcon />
                 </Button>
               </ButtonGroup>
             </Box>
           )}
           
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
             >
               <FeatureDetailsPanel 
                 feature={selectedFeature}
                 onClose={() => setSelectedFeature(null)}
               />
             </Paper>
           )}
         </Box>
       );
     }
     ```

2. **Create Interactive Table Viewer:**
   - Build comprehensive data table with advanced features:
     ```typescript
     // src/components/output/TableViewer.tsx
     import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
     
     export interface TableViewerProps {
       data: any[];
       columns?: GridColDef[];
       height?: number;
       searchable?: boolean;
       exportable?: boolean;
       selectable?: boolean;
     }
     
     export function TableViewer({
       data,
       columns,
       height = 400,
       searchable = true,
       exportable = true,
       selectable = false,
     }: TableViewerProps) {
       const [searchText, setSearchText] = useState('');
       const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);
       
       // Auto-generate columns if not provided
       const tableColumns = useMemo(() => {
         if (columns) return columns;
         
         if (data.length === 0) return [];
         
         const sampleRow = data[0];
         return Object.keys(sampleRow).map((key): GridColDef => ({
           field: key,
           headerName: key.charAt(0).toUpperCase() + key.slice(1),
           width: getColumnWidth(key, sampleRow[key]),
           type: inferColumnType(sampleRow[key]),
           filterable: true,
           sortable: true,
           renderCell: (params) => renderCellContent(params.value),
         }));
       }, [data, columns]);
       
       const filteredData = useMemo(() => {
         if (!searchText) return data;
         
         return data.filter(row =>
           Object.values(row).some(value =>
             String(value).toLowerCase().includes(searchText.toLowerCase())
           )
         );
       }, [data, searchText]);
       
       const handleExport = (format: 'csv' | 'json' | 'excel') => {
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
       };
       
       return (
         <Box sx={{ height, width: '100%' }}>
           {/* Table Controls */}
           <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
             {searchable && (
               <TextField
                 size="small"
                 placeholder="Search table..."
                 value={searchText}
                 onChange={(e) => setSearchText(e.target.value)}
                 InputProps={{
                   startAdornment: <SearchIcon />,
                 }}
                 sx={{ minWidth: 250 }}
               />
             )}
             
             {exportable && (
               <ButtonGroup variant="outlined" size="small">
                 <Button onClick={() => handleExport('csv')}>
                   Export CSV
                 </Button>
                 <Button onClick={() => handleExport('json')}>
                   Export JSON
                 </Button>
                 <Button onClick={() => handleExport('excel')}>
                   Export Excel
                 </Button>
               </ButtonGroup>
             )}
           </Box>
           
           {/* Data Grid */}
           <DataGrid
             rows={filteredData.map((row, index) => ({ id: index, ...row }))}
             columns={tableColumns}
             checkboxSelection={selectable}
             disableRowSelectionOnClick={!selectable}
             onRowSelectionModelChange={setSelectedRows}
             density="compact"
             sx={{
               '& .MuiDataGrid-cell': {
                 borderBottom: '1px solid #e0e0e0',
               },
               '& .MuiDataGrid-row:hover': {
                 backgroundColor: 'action.hover',
               },
             }}
           />
           
           {/* Table Summary */}
           <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <Typography variant="body2" color="text.secondary">
               Showing {filteredData.length} of {data.length} rows
               {selectedRows.length > 0 && ` (${selectedRows.length} selected)`}
             </Typography>
             
             {selectedRows.length > 0 && (
               <Button
                 size="small"
                 onClick={() => setSelectedRows([])}
                 startIcon={<ClearIcon />}
               >
                 Clear Selection
               </Button>
             )}
           </Box>
         </Box>
       );
     }
     ```

3. **Build Chart Visualization Components:**
   - Implement Chart.js integration for multiple chart types:
     ```typescript
     // src/components/output/ChartViewer.tsx
     import {
       Chart as ChartJS,
       CategoryScale,
       LinearScale,
       BarElement,
       LineElement,
       PointElement,
       ArcElement,
       Title,
       Tooltip,
       Legend,
     } from 'chart.js';
     import { Bar, Line, Pie, Scatter, Doughnut } from 'react-chartjs-2';
     
     ChartJS.register(
       CategoryScale,
       LinearScale,
       BarElement,
       LineElement,
       PointElement,
       ArcElement,
       Title,
       Tooltip,
       Legend
     );
     
     export interface ChartViewerProps {
       data: ChartData;
       type: 'bar' | 'line' | 'pie' | 'scatter' | 'doughnut';
       title?: string;
       height?: number;
       interactive?: boolean;
       downloadable?: boolean;
     }
     
     export function ChartViewer({
       data,
       type,
       title,
       height = 400,
       interactive = true,
       downloadable = true,
     }: ChartViewerProps) {
       const chartRef = useRef<ChartJS>(null);
       const [isFullscreen, setIsFullscreen] = useState(false);
       
       const chartOptions = useMemo(() => ({
         responsive: true,
         maintainAspectRatio: false,
         interaction: {
           enabled: interactive,
         },
         plugins: {
           legend: {
             position: 'top' as const,
           },
           title: {
             display: !!title,
             text: title,
           },
           tooltip: {
             enabled: interactive,
             callbacks: {
               label: (context: any) => {
                 return `${context.dataset.label}: ${context.parsed.y}`;
               },
             },
           },
         },
         scales: type !== 'pie' && type !== 'doughnut' ? {
           y: {
             beginAtZero: true,
           },
         } : {},
       }), [title, interactive, type]);
       
       const renderChart = () => {
         switch (type) {
           case 'bar':
             return <Bar ref={chartRef} data={data} options={chartOptions} />;
           case 'line':
             return <Line ref={chartRef} data={data} options={chartOptions} />;
           case 'pie':
             return <Pie ref={chartRef} data={data} options={chartOptions} />;
           case 'scatter':
             return <Scatter ref={chartRef} data={data} options={chartOptions} />;
           case 'doughnut':
             return <Doughnut ref={chartRef} data={data} options={chartOptions} />;
           default:
             return null;
         }
       };
       
       const handleDownload = () => {
         if (chartRef.current) {
           const canvas = chartRef.current.canvas;
           const url = canvas.toDataURL('image/png');
           const link = document.createElement('a');
           link.download = `${title || 'chart'}.png`;
           link.href = url;
           link.click();
         }
       };
       
       return (
         <Box sx={{ height, width: '100%', position: 'relative' }}>
           {/* Chart Controls */}
           <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
             <ButtonGroup size="small" variant="outlined">
               {downloadable && (
                 <Button onClick={handleDownload}>
                   <DownloadIcon />
                 </Button>
               )}
               <Button onClick={() => setIsFullscreen(true)}>
                 <FullscreenIcon />
               </Button>
             </ButtonGroup>
           </Box>
           
           {/* Chart Content */}
           <Box sx={{ height: '100%', width: '100%' }}>
             {renderChart()}
           </Box>
           
           {/* Fullscreen Modal */}
           <Dialog
             open={isFullscreen}
             onClose={() => setIsFullscreen(false)}
             maxWidth="lg"
             fullWidth
           >
             <DialogTitle>
               {title}
               <IconButton
                 onClick={() => setIsFullscreen(false)}
                 sx={{ position: 'absolute', right: 8, top: 8 }}
               >
                 <CloseIcon />
               </IconButton>
             </DialogTitle>
             <DialogContent sx={{ height: 600 }}>
               {renderChart()}
             </DialogContent>
           </Dialog>
         </Box>
       );
     }
     ```

4. **Implement Universal Output Renderer:**
   - Create intelligent output type detection and rendering:
     ```typescript
     // src/components/output/OutputRenderer.tsx
     export interface OutputRendererProps {
       data: any;
       metadata?: OutputMetadata;
       title?: string;
       height?: number;
       interactive?: boolean;
     }
     
     export function OutputRenderer({
       data,
       metadata,
       title,
       height = 400,
       interactive = true,
     }: OutputRendererProps) {
       const outputType = useMemo(() => {
         return detectOutputType(data, metadata);
       }, [data, metadata]);
       
       const renderOutput = () => {
         switch (outputType) {
           case 'geojson':
             return (
               <MapViewer
                 data={data}
                 height={height}
                 interactive={interactive}
               />
             );
           
           case 'table':
             return (
               <TableViewer
                 data={data}
                 height={height}
                 searchable={interactive}
                 exportable={interactive}
               />
             );
           
           case 'chart':
             return (
               <ChartViewer
                 data={transformToChartData(data, metadata)}
                 type={metadata?.chartType || 'bar'}
                 title={title}
                 height={height}
                 interactive={interactive}
               />
             );
           
           case 'image':
             return (
               <ImageViewer
                 src={data}
                 alt={title}
                 maxHeight={height}
                 zoomable={interactive}
               />
             );
           
           case 'text':
             return (
               <TextViewer
                 content={data}
                 language={metadata?.language}
                 maxHeight={height}
                 searchable={interactive}
               />
             );
           
           case 'json':
             return (
               <JsonViewer
                 data={data}
                 maxHeight={height}
                 expandable={interactive}
               />
             );
           
           default:
             return (
               <GenericViewer
                 data={data}
                 maxHeight={height}
               />
             );
         }
       };
       
       return (
         <Card>
           {title && (
             <CardHeader
               title={title}
               subheader={`Output Type: ${outputType.toUpperCase()}`}
               action={
                 <Tooltip title="Output Information">
                   <IconButton>
                     <InfoIcon />
                   </IconButton>
                 </Tooltip>
               }
             />
           )}
           <CardContent sx={{ p: 0 }}>
             {renderOutput()}
           </CardContent>
         </Card>
       );
     }
     
     // src/utils/outputTypeDetection.ts
     export function detectOutputType(data: any, metadata?: OutputMetadata): OutputType {
       // Explicit type from metadata
       if (metadata?.type) {
         return metadata.type;
       }
       
       // GeoJSON detection
       if (isGeoJSON(data)) {
         return 'geojson';
       }
       
       // Table/array detection
       if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
         return 'table';
       }
       
       // Chart data detection
       if (isChartData(data)) {
         return 'chart';
       }
       
       // Image detection
       if (typeof data === 'string' && isImageUrl(data)) {
         return 'image';
       }
       
       // JSON object
       if (typeof data === 'object' && data !== null) {
         return 'json';
       }
       
       // Plain text
       if (typeof data === 'string') {
         return 'text';
       }
       
       return 'generic';
     }
     ```

## 3. Specialized Viewers Implementation

**Image Viewer with Zoom and Gallery:**
```typescript
// src/components/output/ImageViewer.tsx
export function ImageViewer({ 
  src, 
  alt, 
  maxHeight = 400,
  zoomable = true 
}: ImageViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  return (
    <Box sx={{ maxHeight, overflow: 'hidden', position: 'relative' }}>
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: 'auto',
          cursor: zoomable ? 'zoom-in' : 'default',
          transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
          transition: 'transform 0.2s ease-in-out',
        }}
        onClick={() => zoomable && setIsZoomed(true)}
      />
      
      {/* Zoom Modal */}
      <Dialog
        open={isZoomed}
        onClose={() => setIsZoomed(false)}
        maxWidth="lg"
        fullWidth
      >
        <ImageZoomViewer
          src={src}
          alt={alt}
          onClose={() => setIsZoomed(false)}
        />
      </Dialog>
    </Box>
  );
}

// src/components/output/TextViewer.tsx
export function TextViewer({
  content,
  language,
  maxHeight = 400,
  searchable = true,
}: TextViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedContent, setHighlightedContent] = useState(content);
  
  useEffect(() => {
    if (searchTerm && searchable) {
      setHighlightedContent(
        highlightSearchTerm(content, searchTerm)
      );
    } else {
      setHighlightedContent(content);
    }
  }, [content, searchTerm, searchable]);
  
  return (
    <Box sx={{ maxHeight, overflow: 'auto' }}>
      {searchable && (
        <TextField
          size="small"
          placeholder="Search in text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 1 }}
        />
      )}
      
      <SyntaxHighlighter
        language={language || 'text'}
        style={docco}
        customStyle={{
          background: 'transparent',
          fontSize: '0.875rem',
        }}
      >
        {highlightedContent}
      </SyntaxHighlighter>
    </Box>
  );
}
```

## 4. Export and Sharing Capabilities

**Universal Export System:**
```typescript
// src/utils/exportUtils.ts
export class OutputExporter {
  static async exportMap(mapData: GeoJSON.FeatureCollection, format: 'geojson' | 'kml' | 'png'): Promise<void> {
    switch (format) {
      case 'geojson':
        this.downloadFile(
          JSON.stringify(mapData, null, 2),
          'map-data.geojson',
          'application/geo+json'
        );
        break;
      
      case 'kml':
        const kml = this.convertGeoJSONToKML(mapData);
        this.downloadFile(kml, 'map-data.kml', 'application/vnd.google-earth.kml+xml');
        break;
      
      case 'png':
        // Export map as image using html2canvas
        const mapElement = document.querySelector('.leaflet-container');
        if (mapElement) {
          const canvas = await html2canvas(mapElement as HTMLElement);
          canvas.toBlob(blob => {
            if (blob) {
              this.downloadBlob(blob, 'map-export.png');
            }
          });
        }
        break;
    }
  }
  
  static exportTable(data: any[], columns: GridColDef[], format: 'csv' | 'excel' | 'json'): void {
    switch (format) {
      case 'csv':
        const csv = this.convertToCSV(data, columns);
        this.downloadFile(csv, 'table-data.csv', 'text/csv');
        break;
      
      case 'excel':
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, 'table-data.xlsx');
        break;
      
      case 'json':
        this.downloadFile(
          JSON.stringify(data, null, 2),
          'table-data.json',
          'application/json'
        );
        break;
    }
  }
  
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, filename);
  }
  
  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
```

## 5. Performance Optimization

**Virtualization for Large Datasets:**
```typescript
// src/components/output/VirtualizedOutput.tsx
export function VirtualizedOutput({ data, renderItem }: VirtualizedOutputProps) {
  const virtuoso = useRef<VirtuosoHandle>(null);
  
  return (
    <Virtuoso
      ref={virtuoso}
      style={{ height: 400 }}
      data={data}
      itemContent={(index, item) => renderItem(item, index)}
      components={{
        Header: () => <OutputHeader />,
        Footer: () => <OutputFooter />,
        EmptyPlaceholder: () => <EmptyState />,
      }}
    />
  );
}

// Lazy loading for heavy components
const LazyMapViewer = lazy(() => import('./MapViewer'));
const LazyChartViewer = lazy(() => import('./ChartViewer'));

export function OptimizedOutputRenderer(props: OutputRendererProps) {
  return (
    <Suspense fallback={<OutputSkeleton />}>
      <OutputRenderer {...props} />
    </Suspense>
  );
}
```

## 6. Expected Output & Deliverables

**Success Criteria:**
- LeafletJS integration with interactive map features
- Comprehensive data table with sorting, filtering, and export
- Chart.js integration supporting multiple visualization types
- Universal output renderer with intelligent type detection
- Image viewer with zoom and gallery capabilities
- Text viewer with syntax highlighting and search
- Export functionality for all output types
- Performance optimization for large datasets

**Deliverables:**
1. **Map Rendering:**
   - `src/components/output/MapViewer.tsx` - Interactive map component
   - `src/components/output/FeaturePopup.tsx` - Feature details
   - `src/components/output/MapControls.tsx` - Map interaction controls

2. **Data Visualization:**
   - `src/components/output/TableViewer.tsx` - Interactive data table
   - `src/components/output/ChartViewer.tsx` - Chart visualization
   - `src/components/output/ImageViewer.tsx` - Image display and zoom
   - `src/components/output/TextViewer.tsx` - Text with syntax highlighting

3. **Universal Rendering:**
   - `src/components/output/OutputRenderer.tsx` - Main renderer component
   - `src/utils/outputTypeDetection.ts` - Type detection logic
   - `src/utils/exportUtils.ts` - Export functionality

4. **Performance & UX:**
   - `src/components/output/VirtualizedOutput.tsx` - Large dataset handling
   - `src/components/output/OutputSkeleton.tsx` - Loading states
   - Lazy loading implementation

## 7. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_4_Full_UI_Mock_Execution/Task_4.3_Output_Rendering_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_UI_Specialist)
- Task reference (Phase 4 / Task 4.3)
- Output rendering architecture
- Visualization libraries integrated
- Type detection and routing logic
- Export capabilities implemented
- Performance optimization strategies
- User interaction features

Please acknowledge receipt and proceed with implementation.