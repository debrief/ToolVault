import type { ExecutionResults } from '../../../types/execution';

/**
 * Mock execution results for advanced analytics tools
 */

// Machine Learning Analysis Results
export const mlAnalysisResults: ExecutionResults = {
  executionId: 'exec_ml_001',
  toolId: 'ml-analyzer',
  status: 'completed',
  startTime: new Date('2024-01-15T12:00:00Z'),
  endTime: new Date('2024-01-15T12:02:15.450Z'),
  duration: 135450,
  results: {
    type: 'ml_analysis',
    model: {
      type: 'classification',
      algorithm: 'random_forest',
      accuracy: 0.947,
      precision: 0.932,
      recall: 0.968,
      f1Score: 0.949
    },
    predictions: [
      { input: 'Sample 1', prediction: 'Category A', confidence: 0.89 },
      { input: 'Sample 2', prediction: 'Category B', confidence: 0.94 },
      { input: 'Sample 3', prediction: 'Category A', confidence: 0.76 },
      { input: 'Sample 4', prediction: 'Category C', confidence: 0.82 },
      { input: 'Sample 5', prediction: 'Category B', confidence: 0.91 }
    ],
    featureImportance: [
      { feature: 'feature_1', importance: 0.342 },
      { feature: 'feature_2', importance: 0.289 },
      { feature: 'feature_3', importance: 0.187 },
      { feature: 'feature_4', importance: 0.124 },
      { feature: 'feature_5', importance: 0.058 }
    ],
    confusionMatrix: {
      categories: ['Category A', 'Category B', 'Category C'],
      matrix: [
        [45, 3, 2],
        [2, 48, 0],
        [1, 2, 47]
      ]
    },
    trainingMetrics: {
      epochs: 100,
      convergence: true,
      finalLoss: 0.0234,
      validationLoss: 0.0267
    }
  },
  metadata: {
    version: '2.3.0',
    environment: 'development',
    performanceMetrics: {
      cpuUsage: 85.4,
      memoryUsage: 512.7,
      networkLatency: 15
    }
  }
};

// Time Series Analysis Results
export const timeSeriesResults: ExecutionResults = {
  executionId: 'exec_ts_002',
  toolId: 'time-series-analyzer',
  status: 'completed',
  startTime: new Date('2024-01-15T12:05:00Z'),
  endTime: new Date('2024-01-15T12:06:45.200Z'),
  duration: 105200,
  results: {
    type: 'time_series',
    analysis: {
      trend: 'increasing',
      seasonality: 'weekly',
      stationarity: false,
      autocorrelation: 0.73
    },
    forecast: {
      periods: 30,
      confidence_interval: 0.95,
      values: Array.from({ length: 30 }, (_, i) => ({
        period: i + 1,
        predicted: 100 + i * 2.5 + Math.sin(i * 0.5) * 10,
        lower_bound: 90 + i * 2.0 + Math.sin(i * 0.5) * 8,
        upper_bound: 110 + i * 3.0 + Math.sin(i * 0.5) * 12
      }))
    },
    decomposition: {
      trend: Array.from({ length: 100 }, (_, i) => 100 + i * 0.5),
      seasonal: Array.from({ length: 100 }, (_, i) => Math.sin(i * 0.1) * 15),
      residual: Array.from({ length: 100 }, () => (Math.random() - 0.5) * 5)
    },
    changePoints: [
      { index: 25, significance: 0.87, description: 'Trend shift detected' },
      { index: 67, significance: 0.92, description: 'Variance change detected' }
    ],
    metrics: {
      mae: 3.42,
      rmse: 4.78,
      mape: 2.15,
      aic: 145.67,
      bic: 158.23
    }
  },
  metadata: {
    version: '1.8.0',
    environment: 'development'
  }
};

// Network Analysis Results
export const networkAnalysisResults: ExecutionResults = {
  executionId: 'exec_network_003',
  toolId: 'network-analyzer',
  status: 'completed',
  startTime: new Date('2024-01-15T12:10:00Z'),
  endTime: new Date('2024-01-15T12:11:30.800Z'),
  duration: 90800,
  results: {
    type: 'network_analysis',
    nodes: [
      { id: 'node_1', label: 'Hub A', degree: 15, betweenness: 0.234, closeness: 0.567 },
      { id: 'node_2', label: 'Hub B', degree: 12, betweenness: 0.189, closeness: 0.489 },
      { id: 'node_3', label: 'Node C', degree: 8, betweenness: 0.145, closeness: 0.334 },
      { id: 'node_4', label: 'Node D', degree: 6, betweenness: 0.098, closeness: 0.278 },
      { id: 'node_5', label: 'Node E', degree: 4, betweenness: 0.067, closeness: 0.201 }
    ],
    edges: [
      { source: 'node_1', target: 'node_2', weight: 0.85 },
      { source: 'node_1', target: 'node_3', weight: 0.72 },
      { source: 'node_2', target: 'node_4', weight: 0.68 },
      { source: 'node_3', target: 'node_5', weight: 0.54 },
      { source: 'node_4', target: 'node_5', weight: 0.43 }
    ],
    communities: [
      {
        id: 'community_1',
        nodes: ['node_1', 'node_2', 'node_3'],
        modularity: 0.432,
        size: 3
      },
      {
        id: 'community_2',
        nodes: ['node_4', 'node_5'],
        modularity: 0.278,
        size: 2
      }
    ],
    metrics: {
      nodeCount: 5,
      edgeCount: 5,
      density: 0.4,
      averageDegree: 9.0,
      clustering: 0.623,
      pathLength: 2.3,
      diameter: 4,
      modularity: 0.345
    },
    centralityRankings: {
      degree: ['node_1', 'node_2', 'node_3', 'node_4', 'node_5'],
      betweenness: ['node_1', 'node_2', 'node_3', 'node_4', 'node_5'],
      closeness: ['node_1', 'node_2', 'node_3', 'node_4', 'node_5']
    }
  },
  metadata: {
    version: '1.5.0',
    environment: 'development'
  }
};

// Image Processing Results
export const imageProcessingResults: ExecutionResults = {
  executionId: 'exec_img_004',
  toolId: 'image-processor',
  status: 'completed',
  startTime: new Date('2024-01-15T12:15:00Z'),
  endTime: new Date('2024-01-15T12:16:45.300Z'),
  duration: 105300,
  results: {
    type: 'image_processing',
    originalImage: {
      width: 1920,
      height: 1080,
      format: 'JPEG',
      size: 2048576,
      colorSpace: 'RGB'
    },
    processedImage: {
      width: 1920,
      height: 1080,
      format: 'PNG',
      size: 3145728,
      colorSpace: 'RGB',
      downloadUrl: '/api/executions/exec_img_004/processed-image'
    },
    operations: [
      {
        name: 'noise_reduction',
        parameters: { algorithm: 'gaussian', kernel_size: 5 },
        duration: 1200
      },
      {
        name: 'contrast_enhancement',
        parameters: { factor: 1.2, method: 'histogram_equalization' },
        duration: 800
      },
      {
        name: 'edge_detection',
        parameters: { algorithm: 'canny', threshold1: 100, threshold2: 200 },
        duration: 1500
      }
    ],
    analysis: {
      brightness: 0.67,
      contrast: 0.82,
      saturation: 0.75,
      sharpness: 0.89,
      colorDistribution: {
        red: { mean: 128.4, std: 45.2, histogram: Array.from({ length: 256 }, () => Math.floor(Math.random() * 1000)) },
        green: { mean: 132.1, std: 43.8, histogram: Array.from({ length: 256 }, () => Math.floor(Math.random() * 1000)) },
        blue: { mean: 125.7, std: 47.1, histogram: Array.from({ length: 256 }, () => Math.floor(Math.random() * 1000)) }
      },
      detectedObjects: [
        { type: 'face', confidence: 0.94, bbox: [150, 200, 300, 400] },
        { type: 'vehicle', confidence: 0.87, bbox: [500, 300, 800, 600] },
        { type: 'building', confidence: 0.91, bbox: [1000, 100, 1500, 700] }
      ]
    },
    metadata: {
      exif: {
        camera: 'Canon EOS R5',
        lens: 'RF 24-70mm f/2.8L IS USM',
        focalLength: '50mm',
        aperture: 'f/5.6',
        shutterSpeed: '1/250s',
        iso: 400,
        captureDate: '2024-01-15T10:30:00Z'
      },
      processing: {
        totalOperations: 3,
        totalProcessingTime: 3500,
        memoryUsage: '256MB',
        gpuAcceleration: true
      }
    }
  },
  metadata: {
    version: '2.1.0',
    environment: 'development'
  }
};

// Financial Analysis Results
export const financialAnalysisResults: ExecutionResults = {
  executionId: 'exec_fin_005',
  toolId: 'financial-analyzer',
  status: 'completed',
  startTime: new Date('2024-01-15T12:20:00Z'),
  endTime: new Date('2024-01-15T12:21:25.600Z'),
  duration: 85600,
  results: {
    type: 'financial_analysis',
    portfolio: {
      totalValue: 1250000.00,
      totalReturn: 87500.00,
      returnPercentage: 7.52,
      volatility: 0.184,
      sharpeRatio: 1.23,
      maxDrawdown: -0.087,
      beta: 0.91
    },
    assets: [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        allocation: 0.25,
        value: 312500.00,
        return: 0.089,
        risk: 0.156,
        beta: 1.12
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        allocation: 0.20,
        value: 250000.00,
        return: 0.076,
        risk: 0.189,
        beta: 1.05
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        allocation: 0.18,
        value: 225000.00,
        return: 0.082,
        risk: 0.142,
        beta: 0.89
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        allocation: 0.15,
        value: 187500.00,
        return: 0.124,
        risk: 0.287,
        beta: 1.45
      },
      {
        symbol: 'SPY',
        name: 'SPDR S&P 500 ETF',
        allocation: 0.22,
        value: 275000.00,
        return: 0.063,
        risk: 0.098,
        beta: 1.00
      }
    ],
    riskMetrics: {
      var95: -0.045,
      var99: -0.067,
      cvar95: -0.052,
      cvar99: -0.078,
      correlation: [
        [1.00, 0.67, 0.72, 0.43, 0.89],
        [0.67, 1.00, 0.68, 0.39, 0.85],
        [0.72, 0.68, 1.00, 0.41, 0.87],
        [0.43, 0.39, 0.41, 1.00, 0.52],
        [0.89, 0.85, 0.87, 0.52, 1.00]
      ]
    },
    optimization: {
      efficientFrontier: Array.from({ length: 20 }, (_, i) => ({
        risk: 0.08 + i * 0.01,
        return: 0.04 + i * 0.008,
        sharpeRatio: (0.04 + i * 0.008) / (0.08 + i * 0.01)
      })),
      optimalAllocation: {
        'AAPL': 0.22,
        'GOOGL': 0.18,
        'MSFT': 0.20,
        'TSLA': 0.12,
        'SPY': 0.28
      },
      expectedReturn: 0.078,
      expectedRisk: 0.142
    },
    scenarios: {
      bullMarket: { probability: 0.35, portfolioReturn: 0.156 },
      bearMarket: { probability: 0.25, portfolioReturn: -0.089 },
      sidewaysMarket: { probability: 0.40, portfolioReturn: 0.034 }
    }
  },
  metadata: {
    version: '3.2.0',
    environment: 'development'
  }
};

export const advancedAnalyticsResults = {
  'ml-analyzer': {
    success: mlAnalysisResults,
    error: {
      code: 'MODEL_TRAINING_FAILED',
      message: 'Machine learning model training failed due to insufficient data',
      details: { minSamplesRequired: 1000, samplesProvided: 450 },
      retryable: true,
      timestamp: new Date()
    }
  },
  'time-series-analyzer': {
    success: timeSeriesResults,
    error: {
      code: 'INSUFFICIENT_DATA_POINTS',
      message: 'Time series analysis requires at least 50 data points',
      details: { minPoints: 50, providedPoints: 23 },
      retryable: false,
      timestamp: new Date()
    }
  },
  'network-analyzer': {
    success: networkAnalysisResults,
    error: {
      code: 'GRAPH_TOO_LARGE',
      message: 'Network graph exceeds maximum size limit',
      details: { maxNodes: 10000, providedNodes: 15000 },
      retryable: true,
      timestamp: new Date()
    }
  },
  'image-processor': {
    success: imageProcessingResults,
    error: {
      code: 'UNSUPPORTED_IMAGE_FORMAT',
      message: 'Image format not supported for processing',
      details: { supportedFormats: ['JPEG', 'PNG', 'TIFF'], providedFormat: 'WEBP' },
      retryable: false,
      timestamp: new Date()
    }
  },
  'financial-analyzer': {
    success: financialAnalysisResults,
    error: {
      code: 'MARKET_DATA_UNAVAILABLE',
      message: 'Unable to retrieve current market data for analysis',
      details: { affectedSymbols: ['AAPL', 'GOOGL'], dataProvider: 'market_api' },
      retryable: true,
      timestamp: new Date()
    }
  }
} as const;