module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/tools',
        'http://localhost:5173/tools/example-tool-id',
      ],
      
      // Build and serve the application
      startServerCommand: 'pnpm preview',
      startServerReadyPattern: 'Local:   http://localhost:5173',
      
      // Number of runs per URL for more reliable results
      numberOfRuns: 3,
      
      // Additional Chrome flags for CI environment
      chromeFlags: [
        '--no-sandbox',
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--no-zygote',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      ],
      
      // Lighthouse settings
      settings: {
        // Skip certain audits that may not be relevant in CI
        skipAudits: [
          'uses-http2',
          'is-crawlable', // May not be relevant for all apps
        ],
        
        // Use a consistent preset
        preset: 'desktop',
        
        // Emulated form factor
        formFactor: 'desktop',
        
        // Throttling settings for consistent results
        throttling: {
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
      },
    },
    
    assert: {
      assertions: {
        // Performance category - strict requirements
        'categories:performance': ['error', { minScore: 0.9 }],
        
        // Accessibility - very important
        'categories:accessibility': ['error', { minScore: 0.95 }],
        
        // Best practices
        'categories:best-practices': ['error', { minScore: 0.9 }],
        
        // SEO
        'categories:seo': ['error', { minScore: 0.85 }],
        
        // Core Web Vitals - based on task requirements
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }], // < 1.8s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // < 2.5s
        'interactive': ['error', { maxNumericValue: 3000 }], // < 3.0s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // < 0.1
        'max-potential-fid': ['error', { maxNumericValue: 100 }], // < 100ms
        
        // Resource optimization
        'unused-javascript': ['warn', { maxNumericValue: 100000 }], // 100KB unused JS
        'unused-css-rules': ['warn', { maxNumericValue: 50000 }], // 50KB unused CSS
        'unminified-css': ['error', { maxNumericValue: 0 }],
        'unminified-javascript': ['error', { maxNumericValue: 0 }],
        
        // Image optimization
        'uses-optimized-images': ['warn', { maxNumericValue: 200000 }], // 200KB savings
        'uses-webp-images': ['warn', { maxNumericValue: 100000 }], // 100KB savings
        'uses-responsive-images': ['warn', { maxNumericValue: 100000 }], // 100KB savings
        
        // Bundle size constraints
        'total-byte-weight': ['error', { maxNumericValue: 1000000 }], // 1MB total
        'dom-size': ['warn', { maxNumericValue: 1500 }], // DOM nodes
        
        // Network efficiency
        'uses-text-compression': ['error', { maxNumericValue: 0 }],
        'efficient-animated-content': ['warn', { maxNumericValue: 100000 }],
        
        // Modern practices
        'uses-passive-event-listeners': ['error', { maxNumericValue: 0 }],
        'no-document-write': ['error', { maxNumericValue: 0 }],
        'uses-http2': 'off', // May not be available in all environments
        
        // Security
        'is-on-https': 'off', // Local development uses HTTP
        'uses-https': 'off', // Local development uses HTTP
      },
    },
    
    upload: {
      // Upload results to temporary public storage for CI
      target: 'temporary-public-storage',
      
      // Optionally, upload to a custom server or service
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: 'your-build-token',
    },
    
    server: {
      // Configuration if running your own LHCI server
      // port: 9001,
      // storage: {
      //   storageMethod: 'sql',
      //   sqlDialect: 'sqlite',
      //   sqlDatabasePath: './lhci.db',
      // },
    },
    
    wizard: {
      // Disable the setup wizard
      disable: true,
    },
  },
};