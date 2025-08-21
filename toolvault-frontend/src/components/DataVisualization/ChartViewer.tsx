import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import './ChartViewer.css';

interface ChartViewerProps {
  data: unknown;
  height?: number;
}

interface TimeSeriesPoint {
  timestamp: string | number;
  value: number;
  [key: string]: unknown;
}

interface HistogramBin {
  bin: string;
  count: number;
  range?: string;
}

const isTimeSeriesData = (data: unknown): data is TimeSeriesPoint[] => {
  if (!Array.isArray(data) || data.length === 0) return false;
  
  const firstItem = data[0];
  return (
    typeof firstItem === 'object' &&
    firstItem !== null &&
    ('timestamp' in firstItem || 'time' in firstItem) &&
    ('value' in firstItem || 'speed' in firstItem || 'direction' in firstItem)
  );
};

const isHistogramData = (data: unknown): data is HistogramBin[] => {
  if (!Array.isArray(data) || data.length === 0) return false;
  
  const firstItem = data[0];
  return (
    typeof firstItem === 'object' &&
    firstItem !== null &&
    'bin' in firstItem &&
    'count' in firstItem
  );
};

const formatTimestamp = (timestamp: string | number): string => {
  if (typeof timestamp === 'number') {
    // Handle Unix timestamps (both seconds and milliseconds)
    const date = timestamp > 1e10 ? new Date(timestamp) : new Date(timestamp * 1000);
    return date.toLocaleTimeString();
  }
  
  if (typeof timestamp === 'string') {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch {
      return timestamp;
    }
  }
  
  return String(timestamp);
};

const normalizeTimeSeriesData = (data: TimeSeriesPoint[]): {
  time: string;
  value: number;
  originalTimestamp: string | number;
}[] => {
  return data.map((point, index) => {
    const rawTimestamp = point.timestamp || point.time || index;
    const timestamp = typeof rawTimestamp === 'string' || typeof rawTimestamp === 'number' ? rawTimestamp : index;
    const value = point.value || point.speed || point.direction || 0;
    
    return {
      time: formatTimestamp(timestamp),
      value: typeof value === 'number' ? value : 0,
      originalTimestamp: timestamp,
    };
  });
};

const normalizeHistogramData = (data: HistogramBin[]): {
  bin: string;
  count: number;
  range?: string;
}[] => {
  return data.map((bin) => ({
    bin: bin.bin || 'Unknown',
    count: typeof bin.count === 'number' ? bin.count : 0,
    range: bin.range,
  }));
};

export const ChartViewer: React.FC<ChartViewerProps> = ({ data, height = 400 }) => {
  if (!data) {
    return (
      <div className="chart-viewer-error">
        <p>No chart data available</p>
      </div>
    );
  }

  // Handle time series data (from Analysis tools)
  if (isTimeSeriesData(data)) {
    const chartData = normalizeTimeSeriesData(data);
    const valueKey = data[0].speed !== undefined ? 'speed' : 
                    data[0].direction !== undefined ? 'direction' : 'value';
    
    const yAxisLabel = valueKey === 'speed' ? 'Speed' : 
                      valueKey === 'direction' ? 'Direction (°)' : 'Value';
    
    return (
      <div className="chart-viewer" style={{ height }}>
        <div className="chart-header">
          <h4>Time Series Chart</h4>
          <span className="chart-info">{data.length} data points</span>
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              stroke="#666"
              fontSize={12}
              tick={{ fill: '#666' }}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tick={{ fill: '#666' }}
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px'
              }}
              labelStyle={{ color: '#333' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#007bff" 
              strokeWidth={2}
              dot={{ fill: '#007bff', strokeWidth: 1, r: 3 }}
              activeDot={{ r: 5, fill: '#007bff' }}
              name={yAxisLabel}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Handle histogram data (from Statistics tools)
  if (isHistogramData(data)) {
    const chartData = normalizeHistogramData(data);
    
    return (
      <div className="chart-viewer" style={{ height }}>
        <div className="chart-header">
          <h4>Histogram</h4>
          <span className="chart-info">{data.length} bins</span>
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="bin" 
              stroke="#666"
              fontSize={12}
              tick={{ fill: '#666' }}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tick={{ fill: '#666' }}
              label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px'
              }}
              labelStyle={{ color: '#333' }}
            />
            <Legend />
            <Bar 
              dataKey="count" 
              fill="#28a745"
              stroke="#1e7e34"
              strokeWidth={1}
              name="Frequency"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="chart-viewer-error">
      <p>Unsupported data format for charting</p>
      <small>Expected time series data with timestamp/value pairs or histogram data with bins</small>
    </div>
  );
};