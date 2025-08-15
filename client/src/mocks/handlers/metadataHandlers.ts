import { http, HttpResponse } from 'msw';
import { 
  simulateNetworkDelay,
  createErrorResponse,
  createSuccessResponse,
  responseCache,
  responseMetrics
} from '../utils/responseHelpers';

/**
 * MSW handlers for metadata and tool discovery endpoints
 */

// Extended tool metadata for enhanced tool information
const extendedToolMetadata = {
  'wordcount': {
    id: 'wordcount',
    name: 'Word Count',
    version: '1.2.0',
    author: 'ToolVault Team',
    documentation: 'https://docs.toolvault.com/tools/wordcount',
    estimatedExecutionTime: '1-3 seconds',
    resourceRequirements: {
      cpu: 'low',
      memory: 'low',
      storage: 'none'
    },
    supportedFormats: ['text/plain', 'text/markdown'],
    examples: [
      {
        name: 'Basic word count',
        inputs: { text: 'Hello world! This is a sample text.' },
        expectedOutput: { wordCount: 8, characterCount: 35 }
      }
    ]
  },
  'geospatial-analysis': {
    id: 'geospatial-analysis',
    name: 'Geospatial Analysis',
    version: '2.1.0',
    author: 'GeoTeam',
    documentation: 'https://docs.toolvault.com/tools/geospatial',
    estimatedExecutionTime: '3-8 seconds',
    resourceRequirements: {
      cpu: 'medium',
      memory: 'medium',
      storage: 'low'
    },
    supportedFormats: ['application/geo+json', 'application/json'],
    examples: [
      {
        name: 'Point analysis',
        inputs: { 
          geojson: { type: 'FeatureCollection', features: [] },
          analysis_type: 'spatial_join'
        }
      }
    ]
  },
  'data-visualizer': {
    id: 'data-visualizer',
    name: 'Data Visualizer',
    version: '1.5.0',
    author: 'DataViz Inc',
    documentation: 'https://docs.toolvault.com/tools/visualizer',
    estimatedExecutionTime: '2-5 seconds',
    resourceRequirements: {
      cpu: 'medium',
      memory: 'medium',
      storage: 'none'
    },
    supportedFormats: ['application/json', 'text/csv'],
    examples: [
      {
        name: 'Line chart',
        inputs: {
          data: { labels: ['A', 'B'], values: [1, 2] },
          chart_type: 'line'
        }
      }
    ]
  }
};

export const metadataHandlers = [
  // Get tool metadata
  http.get('/api/tools/:toolId/metadata', async ({ request, params }) => {
    const startTime = Date.now();
    const toolId = params.toolId as string;
    
    try {
      await simulateNetworkDelay(25);

      // Check cache first
      const cacheKey = `metadata:${toolId}`;
      let metadata = responseCache.get(cacheKey);
      let fromCache = false;

      if (!metadata) {
        metadata = extendedToolMetadata[toolId as keyof typeof extendedToolMetadata];
        
        if (!metadata) {
          const errorResponse = createErrorResponse(
            'TOOL_NOT_FOUND',
            `Tool '${toolId}' not found`,
            { toolId, availableTools: Object.keys(extendedToolMetadata) },
            404
          );
          return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
        }

        responseCache.set(cacheKey, metadata, 10 * 60 * 1000); // Cache for 10 minutes
      } else {
        fromCache = true;
      }

      const responseTime = Date.now() - startTime;
      const response = createSuccessResponse(metadata, responseTime, fromCache);
      const responseSize = JSON.stringify(response).length;

      responseMetrics.record('/api/tools/*/metadata', 'GET', responseTime, fromCache, responseSize);

      return HttpResponse.json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorResponse = createErrorResponse(
        'METADATA_ERROR',
        'Failed to get tool metadata',
        { toolId, error: error instanceof Error ? error.message : error },
        500
      );

      responseMetrics.record('/api/tools/*/metadata', 'GET', responseTime, false, 0);
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    }
  }),

  // Get all available tools metadata
  http.get('/api/tools/metadata', async ({ request }) => {
    const startTime = Date.now();
    
    try {
      await simulateNetworkDelay(40);

      const url = new URL(request.url);
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search');
      
      let tools = Object.values(extendedToolMetadata);

      // Apply category filter
      if (category) {
        // Mock category filtering based on tool names/descriptions
        tools = tools.filter(tool => {
          const toolCategory = tool.name.toLowerCase().includes('data') ? 'data' :
                              tool.name.toLowerCase().includes('geo') ? 'geospatial' :
                              'text';
          return toolCategory === category.toLowerCase();
        });
      }

      // Apply search filter
      if (search) {
        const searchTerm = search.toLowerCase();
        tools = tools.filter(tool =>
          tool.name.toLowerCase().includes(searchTerm) ||
          tool.id.toLowerCase().includes(searchTerm)
        );
      }

      const responseTime = Date.now() - startTime;
      const response = createSuccessResponse({
        tools,
        total: tools.length,
        filters: { category, search }
      }, responseTime);
      const responseSize = JSON.stringify(response).length;

      responseMetrics.record('/api/tools/metadata', 'GET', responseTime, false, responseSize);

      return HttpResponse.json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorResponse = createErrorResponse(
        'METADATA_LIST_ERROR',
        'Failed to get tools metadata',
        { error: error instanceof Error ? error.message : error },
        500
      );

      responseMetrics.record('/api/tools/metadata', 'GET', responseTime, false, 0);
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    }
  }),

  // Get tool schema/documentation
  http.get('/api/tools/:toolId/schema', async ({ request, params }) => {
    const startTime = Date.now();
    const toolId = params.toolId as string;
    
    try {
      await simulateNetworkDelay(30);

      const metadata = extendedToolMetadata[toolId as keyof typeof extendedToolMetadata];
      
      if (!metadata) {
        const errorResponse = createErrorResponse(
          'TOOL_NOT_FOUND',
          `Tool '${toolId}' not found`,
          { toolId },
          404
        );
        return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
      }

      // Mock OpenAPI-style schema
      const schema = {
        openapi: '3.0.0',
        info: {
          title: metadata.name,
          version: metadata.version,
          description: `API schema for ${metadata.name}`,
          contact: {
            name: metadata.author,
            url: metadata.documentation
          }
        },
        paths: {
          '/execute': {
            post: {
              summary: `Execute ${metadata.name}`,
              operationId: `execute${metadata.id}`,
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        toolId: { type: 'string', enum: [metadata.id] },
                        inputs: {
                          type: 'object',
                          properties: this.generateInputSchema(toolId)
                        }
                      },
                      required: ['toolId', 'inputs']
                    }
                  }
                }
              },
              responses: {
                '202': {
                  description: 'Execution started',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          executionId: { type: 'string' },
                          status: { type: 'string', enum: ['running'] }
                        }
                      }
                    }
                  }
                },
                '400': {
                  description: 'Invalid input'
                },
                '500': {
                  description: 'Server error'
                }
              }
            }
          }
        }
      };

      const responseTime = Date.now() - startTime;
      const response = createSuccessResponse(schema, responseTime);
      const responseSize = JSON.stringify(response).length;

      responseMetrics.record('/api/tools/*/schema', 'GET', responseTime, false, responseSize);

      return HttpResponse.json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorResponse = createErrorResponse(
        'SCHEMA_ERROR',
        'Failed to get tool schema',
        { toolId, error: error instanceof Error ? error.message : error },
        500
      );

      responseMetrics.record('/api/tools/*/schema', 'GET', responseTime, false, 0);
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    }
  }),

  // Get system capabilities/info
  http.get('/api/system/info', async ({ request }) => {
    const startTime = Date.now();
    
    try {
      await simulateNetworkDelay(20);

      const systemInfo = {
        version: '1.0.0',
        buildNumber: 'build-2024.01.15.1',
        environment: process.env.NODE_ENV || 'development',
        features: {
          executionTracking: true,
          progressUpdates: true,
          executionCancellation: true,
          resultsCaching: true,
          batchExecution: false, // Future feature
          streamingResults: false // Future feature
        },
        limits: {
          maxConcurrentExecutions: 10,
          maxExecutionTime: 300000, // 5 minutes
          maxInputSize: 10485760, // 10MB
          maxResultSize: 52428800 // 50MB
        },
        supportedFormats: {
          input: ['application/json', 'text/plain', 'application/geo+json'],
          output: ['application/json', 'text/csv', 'application/pdf']
        },
        statistics: {
          totalExecutions: Math.floor(Math.random() * 10000) + 1000,
          avgExecutionTime: Math.floor(Math.random() * 5000) + 2000,
          successRate: 0.95 + Math.random() * 0.04, // 95-99%
          uptime: '99.9%'
        }
      };

      const responseTime = Date.now() - startTime;
      const response = createSuccessResponse(systemInfo, responseTime);
      const responseSize = JSON.stringify(response).length;

      responseMetrics.record('/api/system/info', 'GET', responseTime, false, responseSize);

      return HttpResponse.json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorResponse = createErrorResponse(
        'SYSTEM_INFO_ERROR',
        'Failed to get system information',
        { error: error instanceof Error ? error.message : error },
        500
      );

      responseMetrics.record('/api/system/info', 'GET', responseTime, false, 0);
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    }
  }),

  // Get API documentation
  http.get('/api/docs', async ({ request }) => {
    const startTime = Date.now();
    
    try {
      await simulateNetworkDelay(50);

      const apiDocs = {
        title: 'ToolVault API Documentation',
        version: '1.0.0',
        description: 'Mock API documentation for ToolVault execution service',
        baseUrl: '/api',
        endpoints: [
          {
            path: '/tools/execute',
            method: 'POST',
            description: 'Start tool execution',
            parameters: [
              { name: 'toolId', type: 'string', required: true, description: 'Tool identifier' },
              { name: 'inputs', type: 'object', required: true, description: 'Tool input parameters' }
            ],
            responses: [
              { status: 202, description: 'Execution started successfully' },
              { status: 400, description: 'Invalid input parameters' },
              { status: 500, description: 'Internal server error' }
            ]
          },
          {
            path: '/executions/{executionId}/status',
            method: 'GET',
            description: 'Get execution status',
            parameters: [
              { name: 'executionId', type: 'string', required: true, description: 'Execution identifier' }
            ]
          },
          {
            path: '/executions/{executionId}/results',
            method: 'GET',
            description: 'Get execution results',
            parameters: [
              { name: 'executionId', type: 'string', required: true, description: 'Execution identifier' }
            ]
          }
        ],
        examples: {
          executeWordCount: {
            description: 'Execute word count tool',
            request: {
              toolId: 'wordcount',
              inputs: { text: 'Hello world! This is a test.' }
            },
            response: {
              executionId: 'exec_wordcount_123',
              status: 'running'
            }
          }
        }
      };

      const responseTime = Date.now() - startTime;
      const response = createSuccessResponse(apiDocs, responseTime);
      const responseSize = JSON.stringify(response).length;

      responseMetrics.record('/api/docs', 'GET', responseTime, false, responseSize);

      return HttpResponse.json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorResponse = createErrorResponse(
        'DOCS_ERROR',
        'Failed to get API documentation',
        { error: error instanceof Error ? error.message : error },
        500
      );

      responseMetrics.record('/api/docs', 'GET', responseTime, false, 0);
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    }
  })
];

// Helper function to generate input schema based on tool ID
function generateInputSchema(toolId: string): Record<string, any> {
  const schemas: Record<string, any> = {
    'wordcount': {
      text: { type: 'string', description: 'Text to analyze' },
      case_sensitive: { type: 'boolean', description: 'Whether to count case-sensitively', default: false }
    },
    'geospatial-analysis': {
      geojson: { type: 'object', description: 'GeoJSON data to analyze' },
      analysis_type: { type: 'string', enum: ['spatial_join', 'buffer', 'intersection'], description: 'Type of analysis' }
    },
    'data-visualizer': {
      data: { type: 'object', description: 'Data to visualize' },
      chart_type: { type: 'string', enum: ['line', 'bar', 'pie', 'scatter'], description: 'Chart type', default: 'line' }
    }
  };

  return schemas[toolId] || {
    input: { type: 'object', description: 'Tool input parameters' }
  };
}