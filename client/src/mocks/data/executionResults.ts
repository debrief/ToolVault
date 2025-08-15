import type { 
  TextAnalysisResult, 
  GeoSpatialResult, 
  ChartDataResult, 
  TableDataResult,
  BinaryFileResult,
  ExecutionResults,
  ExecutionError,
  ExecutionErrorCode
} from '../../types/execution';

/**
 * Mock execution results for different tool types
 */

// Word Count Tool Results
export const wordCountResults: ExecutionResults = {
  executionId: 'exec_wordcount_123',
  toolId: 'wordcount',
  status: 'completed',
  startTime: new Date('2024-01-15T10:30:00Z'),
  endTime: new Date('2024-01-15T10:30:01.250Z'),
  duration: 1250,
  results: {
    wordCount: 1247,
    characterCount: 7832,
    paragraphCount: 12,
    sentenceCount: 73,
    averageWordsPerSentence: 17.1,
    readingTime: '5 minutes',
    wordFrequency: [
      { word: 'analysis', count: 23 },
      { word: 'data', count: 18 },
      { word: 'tool', count: 15 },
      { word: 'process', count: 12 },
      { word: 'system', count: 10 },
      { word: 'user', count: 9 },
      { word: 'interface', count: 8 },
      { word: 'execution', count: 7 }
    ],
    sentiment: {
      score: 0.7,
      magnitude: 0.8,
      label: 'positive' as const
    }
  } as TextAnalysisResult,
  metadata: {
    version: '1.0.0',
    environment: 'development',
    performanceMetrics: {
      cpuUsage: 15.2,
      memoryUsage: 24.8,
      networkLatency: 45
    }
  }
};

// GeoSpatial Analysis Results
export const geoSpatialResults: ExecutionResults = {
  executionId: 'exec_geo_456',
  toolId: 'geospatial-analysis',
  status: 'completed',
  startTime: new Date('2024-01-15T10:35:00Z'),
  endTime: new Date('2024-01-15T10:35:03.450Z'),
  duration: 3450,
  results: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        properties: {
          name: 'San Francisco',
          population: 883305,
          area: 121.4,
          elevation: 52,
          timezone: 'America/Los_Angeles'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-74.0059, 40.7128]
        },
        properties: {
          name: 'New York City',
          population: 8336817,
          area: 778.2,
          elevation: 10,
          timezone: 'America/New_York'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-122.5194, 37.6749],
            [-122.3194, 37.6749],
            [-122.3194, 37.8749],
            [-122.5194, 37.8749],
            [-122.5194, 37.6749]
          ]]
        },
        properties: {
          name: 'San Francisco Bay Area',
          type: 'region',
          population: 7750000
        }
      }
    ],
    metadata: {
      totalFeatures: 3,
      boundingBox: [-122.5194, 37.6749, -74.0059, 40.7128],
      projection: 'EPSG:4326',
      dataSource: 'OpenStreetMap'
    }
  } as GeoSpatialResult,
  metadata: {
    version: '2.1.0',
    environment: 'development'
  }
};

// Chart Data Results
export const chartDataResults: ExecutionResults = {
  executionId: 'exec_chart_789',
  toolId: 'data-visualizer',
  status: 'completed',
  startTime: new Date('2024-01-15T10:40:00Z'),
  endTime: new Date('2024-01-15T10:40:02.100Z'),
  duration: 2100,
  results: {
    type: 'chart',
    chartType: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Sales Revenue',
          data: [12000, 15000, 11000, 18000, 22000, 19000],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2
        },
        {
          label: 'Customer Acquisition',
          data: [450, 580, 420, 720, 890, 650],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2
        }
      ]
    },
    options: {
      title: 'Monthly Performance Metrics',
      xAxisLabel: 'Month',
      yAxisLabel: 'Value',
      legend: true
    }
  } as ChartDataResult,
  metadata: {
    version: '1.5.0',
    environment: 'development'
  }
};

// Table Data Results
export const tableDataResults: ExecutionResults = {
  executionId: 'exec_table_101',
  toolId: 'data-processor',
  status: 'completed',
  startTime: new Date('2024-01-15T10:45:00Z'),
  endTime: new Date('2024-01-15T10:45:01.800Z'),
  duration: 1800,
  results: {
    type: 'table',
    columns: [
      { key: 'id', title: 'ID', dataType: 'number', sortable: true },
      { key: 'name', title: 'Product Name', dataType: 'string', sortable: true },
      { key: 'category', title: 'Category', dataType: 'string', sortable: true },
      { key: 'price', title: 'Price ($)', dataType: 'number', sortable: true },
      { key: 'inStock', title: 'In Stock', dataType: 'boolean', sortable: false },
      { key: 'lastUpdated', title: 'Last Updated', dataType: 'date', sortable: true }
    ],
    rows: [
      {
        id: 1,
        name: 'Wireless Headphones',
        category: 'Electronics',
        price: 129.99,
        inStock: true,
        lastUpdated: '2024-01-14T15:30:00Z'
      },
      {
        id: 2,
        name: 'Coffee Maker',
        category: 'Appliances',
        price: 89.50,
        inStock: false,
        lastUpdated: '2024-01-13T09:15:00Z'
      },
      {
        id: 3,
        name: 'Running Shoes',
        category: 'Sports',
        price: 119.99,
        inStock: true,
        lastUpdated: '2024-01-15T08:45:00Z'
      },
      {
        id: 4,
        name: 'Desk Lamp',
        category: 'Home & Garden',
        price: 45.75,
        inStock: true,
        lastUpdated: '2024-01-12T14:20:00Z'
      },
      {
        id: 5,
        name: 'Bluetooth Speaker',
        category: 'Electronics',
        price: 79.99,
        inStock: false,
        lastUpdated: '2024-01-11T16:00:00Z'
      }
    ],
    metadata: {
      totalRows: 5,
      totalColumns: 6,
      summary: {
        avgPrice: 93.04,
        inStockCount: 3,
        outOfStockCount: 2,
        categories: ['Electronics', 'Appliances', 'Sports', 'Home & Garden']
      }
    }
  } as TableDataResult,
  metadata: {
    version: '1.2.0',
    environment: 'development'
  }
};

// Binary File Results
export const binaryFileResults: ExecutionResults = {
  executionId: 'exec_file_202',
  toolId: 'file-processor',
  status: 'completed',
  startTime: new Date('2024-01-15T10:50:00Z'),
  endTime: new Date('2024-01-15T10:50:05.300Z'),
  duration: 5300,
  results: {
    type: 'file',
    filename: 'analysis_report.pdf',
    mimeType: 'application/pdf',
    size: 2048576, // 2MB
    downloadUrl: '/api/executions/exec_file_202/download',
    preview: {
      thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      description: 'PDF report containing detailed analysis results with charts and tables'
    }
  } as BinaryFileResult,
  metadata: {
    version: '1.0.0',
    environment: 'development',
    performanceMetrics: {
      cpuUsage: 45.7,
      memoryUsage: 128.4,
      networkLatency: 12
    }
  }
};

// Complex Multi-Output Results
export const complexAnalysisResults: ExecutionResults = {
  executionId: 'exec_complex_303',
  toolId: 'advanced-analyzer',
  status: 'completed',
  startTime: new Date('2024-01-15T11:00:00Z'),
  endTime: new Date('2024-01-15T11:00:08.750Z'),
  duration: 8750,
  results: {
    summary: {
      totalDataPoints: 15420,
      processingTime: '8.75 seconds',
      accuracy: 96.8,
      confidence: 0.94
    },
    textAnalysis: {
      wordCount: 3247,
      sentiment: { score: 0.6, label: 'positive' as const },
      keyPhrases: ['machine learning', 'data analysis', 'performance optimization']
    },
    chartData: {
      type: 'chart',
      chartType: 'bar',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Performance Score',
          data: [85, 92, 88, 96],
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6']
        }]
      }
    },
    geoData: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: { name: 'Analysis Center', confidence: 0.95 }
      }],
      metadata: { totalFeatures: 1, boundingBox: [-1, -1, 1, 1], projection: 'EPSG:4326' }
    }
  },
  metadata: {
    version: '3.0.0',
    environment: 'development',
    performanceMetrics: {
      cpuUsage: 78.3,
      memoryUsage: 256.7,
      networkLatency: 8
    }
  }
};

// Error responses
export const executionErrors: Record<ExecutionErrorCode, ExecutionError> = {
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    message: 'Input validation failed: text parameter is required and cannot be empty',
    details: {
      field: 'text',
      provided: '',
      expected: 'non-empty string',
      validation: 'required|min:1'
    },
    retryable: false,
    timestamp: new Date('2024-01-15T10:30:00Z')
  },
  RESOURCE_EXHAUSTED: {
    code: 'RESOURCE_EXHAUSTED',
    message: 'Execution failed due to insufficient system resources',
    details: {
      memoryUsage: '95%',
      cpuUsage: '98%',
      diskSpace: '2GB remaining',
      recommendation: 'Try again later when system resources are available'
    },
    retryable: true,
    timestamp: new Date('2024-01-15T10:35:00Z')
  },
  TOOL_UNAVAILABLE: {
    code: 'TOOL_UNAVAILABLE',
    message: 'The requested tool is temporarily unavailable for maintenance',
    details: {
      toolId: 'advanced-analyzer',
      maintenanceWindow: '2024-01-15T11:00:00Z to 2024-01-15T13:00:00Z',
      estimatedReturnTime: '2024-01-15T13:00:00Z'
    },
    retryable: true,
    timestamp: new Date('2024-01-15T10:40:00Z')
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    message: 'Execution timed out after 30 seconds',
    details: {
      timeoutDuration: 30000,
      progress: 0.75,
      lastStep: 'processing-analysis-step-3'
    },
    retryable: true,
    timestamp: new Date('2024-01-15T10:45:00Z')
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'An internal server error occurred during execution',
    details: {
      errorId: 'err_internal_500_abc123',
      supportReference: 'Please reference this ID when contacting support'
    },
    retryable: true,
    timestamp: new Date('2024-01-15T10:50:00Z')
  },
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    message: 'User does not have permission to execute this tool',
    details: {
      requiredPermission: 'tool:execute:advanced-analyzer',
      userPermissions: ['tool:execute:basic', 'tool:view:all'],
      action: 'Contact administrator to request additional permissions'
    },
    retryable: false,
    timestamp: new Date('2024-01-15T10:55:00Z')
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    message: 'Rate limit exceeded: too many requests in the current time window',
    details: {
      currentLimit: 100,
      windowSize: '1 hour',
      requestCount: 101,
      resetTime: '2024-01-15T12:00:00Z'
    },
    retryable: true,
    timestamp: new Date('2024-01-15T11:00:00Z')
  },
  VALIDATION_FAILED: {
    code: 'VALIDATION_FAILED',
    message: 'Input data validation failed against tool schema',
    details: {
      errors: [
        { field: 'email', message: 'Invalid email format' },
        { field: 'age', message: 'Must be between 0 and 150' }
      ],
      schema: 'tool-schema-v2.json'
    },
    retryable: false,
    timestamp: new Date('2024-01-15T11:05:00Z')
  },
  EXECUTION_CANCELLED: {
    code: 'EXECUTION_CANCELLED',
    message: 'Execution was cancelled by user request',
    details: {
      cancelledAt: '2024-01-15T11:10:00Z',
      progress: 0.45,
      reason: 'user_requested'
    },
    retryable: false,
    timestamp: new Date('2024-01-15T11:10:00Z')
  }
};

// Tool-specific result generators
export const mockExecutionResults: Record<string, { success: ExecutionResults; error: ExecutionError }> = {
  'wordcount': {
    success: wordCountResults,
    error: executionErrors.INVALID_INPUT
  },
  'geospatial-analysis': {
    success: geoSpatialResults,
    error: executionErrors.RESOURCE_EXHAUSTED
  },
  'data-visualizer': {
    success: chartDataResults,
    error: executionErrors.VALIDATION_FAILED
  },
  'data-processor': {
    success: tableDataResults,
    error: executionErrors.TIMEOUT
  },
  'file-processor': {
    success: binaryFileResults,
    error: executionErrors.TOOL_UNAVAILABLE
  },
  'advanced-analyzer': {
    success: complexAnalysisResults,
    error: executionErrors.INTERNAL_ERROR
  }
};

// Generate dynamic results based on inputs
export function generateDynamicResult(toolId: string, inputs: Record<string, any>): any {
  switch (toolId) {
    case 'wordcount':
      const text = inputs.text || '';
      return {
        ...wordCountResults.results,
        wordCount: Math.max(1, text.split(/\s+/).length),
        characterCount: text.length,
        paragraphCount: Math.max(1, text.split(/\n\s*\n/).length),
        sentenceCount: Math.max(1, text.split(/[.!?]+/).length - 1)
      };
    
    case 'data-visualizer':
      return {
        ...chartDataResults.results,
        data: {
          ...chartDataResults.results.data,
          datasets: chartDataResults.results.data.datasets.map(dataset => ({
            ...dataset,
            data: dataset.data.map(() => Math.floor(Math.random() * 25000) + 5000)
          }))
        }
      };
    
    default:
      return mockExecutionResults[toolId]?.success.results || { message: 'Generic execution result' };
  }
}