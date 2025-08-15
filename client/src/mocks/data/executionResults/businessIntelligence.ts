import type { ExecutionResults } from '../../../types/execution';

/**
 * Mock execution results for business intelligence and reporting tools
 */

// Sales Dashboard Results
export const salesDashboardResults: ExecutionResults = {
  executionId: 'exec_sales_001',
  toolId: 'sales-dashboard',
  status: 'completed',
  startTime: new Date('2024-01-15T13:00:00Z'),
  endTime: new Date('2024-01-15T13:01:45.200Z'),
  duration: 105200,
  results: {
    type: 'business_dashboard',
    period: {
      start: '2024-01-01',
      end: '2024-01-15',
      label: 'January 2024 (YTD)'
    },
    kpis: {
      totalRevenue: 2847532.00,
      revenueGrowth: 0.156,
      totalOrders: 1247,
      orderGrowth: 0.089,
      averageOrderValue: 2284.32,
      aovGrowth: 0.067,
      conversionRate: 0.0342,
      conversionGrowth: 0.023
    },
    salesByRegion: [
      { region: 'North America', revenue: 1423766.00, percentage: 50.0, growth: 0.145 },
      { region: 'Europe', revenue: 853509.60, percentage: 30.0, growth: 0.189 },
      { region: 'Asia Pacific', revenue: 398455.20, percentage: 14.0, growth: 0.234 },
      { region: 'Latin America', revenue: 113751.60, percentage: 4.0, growth: 0.098 },
      { region: 'Other', revenue: 57050.80, percentage: 2.0, growth: 0.067 }
    ],
    productPerformance: [
      {
        productId: 'PROD_001',
        name: 'Enterprise Software License',
        revenue: 967532.00,
        units: 234,
        growth: 0.187,
        margin: 0.78
      },
      {
        productId: 'PROD_002',
        name: 'Professional Services',
        revenue: 683421.00,
        units: 156,
        growth: 0.145,
        margin: 0.65
      },
      {
        productId: 'PROD_003',
        name: 'Training & Certification',
        revenue: 341234.00,
        units: 89,
        growth: 0.098,
        margin: 0.82
      },
      {
        productId: 'PROD_004',
        name: 'Support & Maintenance',
        revenue: 512876.00,
        units: 312,
        growth: 0.067,
        margin: 0.89
      }
    ],
    salesTrend: Array.from({ length: 15 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      dailyRevenue: 150000 + Math.sin(i * 0.5) * 25000 + Math.random() * 15000,
      cumulativeRevenue: (i + 1) * 185000 + Math.sin(i * 0.3) * 50000,
      orders: 75 + Math.floor(Math.sin(i * 0.4) * 15) + Math.floor(Math.random() * 10)
    })),
    topCustomers: [
      { customerId: 'CUST_001', name: 'TechCorp Inc.', revenue: 234567.00, orders: 23 },
      { customerId: 'CUST_002', name: 'Global Solutions Ltd.', revenue: 198432.00, orders: 18 },
      { customerId: 'CUST_003', name: 'Innovate Systems', revenue: 176543.00, orders: 15 },
      { customerId: 'CUST_004', name: 'Digital Dynamics', revenue: 145678.00, orders: 12 },
      { customerId: 'CUST_005', name: 'Future Tech Co.', revenue: 123456.00, orders: 9 }
    ],
    forecast: {
      nextPeriod: 'February 2024',
      projectedRevenue: 3125000.00,
      confidence: 0.87,
      factors: [
        'Seasonal trends indicate 10% increase',
        'New product launch expected to contribute 8%',
        'Market expansion into 2 new regions'
      ]
    }
  },
  metadata: {
    version: '2.4.0',
    environment: 'development',
    dataFreshness: '2024-01-15T12:45:00Z',
    calculationDuration: 1520
  }
};

// Customer Analytics Results
export const customerAnalyticsResults: ExecutionResults = {
  executionId: 'exec_customer_002',
  toolId: 'customer-analytics',
  status: 'completed',
  startTime: new Date('2024-01-15T13:05:00Z'),
  endTime: new Date('2024-01-15T13:07:20.800Z'),
  duration: 140800,
  results: {
    type: 'customer_analytics',
    overview: {
      totalCustomers: 12847,
      activeCustomers: 9234,
      newCustomers: 1456,
      churnedCustomers: 234,
      churnRate: 0.025,
      ltv: 18450.00,
      cac: 1250.00,
      ltvCacRatio: 14.76
    },
    segmentation: [
      {
        segment: 'VIP Customers',
        count: 1285,
        percentage: 10.0,
        avgRevenue: 45600.00,
        avgOrders: 34,
        retentionRate: 0.95,
        characteristics: ['High spend', 'Long tenure', 'Low churn risk']
      },
      {
        segment: 'Regular Customers',
        count: 6423,
        percentage: 50.0,
        avgRevenue: 12300.00,
        avgOrders: 12,
        retentionRate: 0.78,
        characteristics: ['Steady purchasing', 'Price conscious', 'Medium engagement']
      },
      {
        segment: 'Occasional Buyers',
        count: 3854,
        percentage: 30.0,
        avgRevenue: 3200.00,
        avgOrders: 3,
        retentionRate: 0.45,
        characteristics: ['Infrequent purchases', 'Deal seekers', 'High churn risk']
      },
      {
        segment: 'New Customers',
        count: 1285,
        percentage: 10.0,
        avgRevenue: 850.00,
        avgOrders: 1,
        retentionRate: 0.62,
        characteristics: ['First purchase', 'Evaluation phase', 'Conversion potential']
      }
    ],
    cohortAnalysis: {
      periods: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
      cohorts: [
        {
          cohort: '2023-07',
          customers: 1000,
          retention: [1.00, 0.72, 0.58, 0.49, 0.43, 0.39]
        },
        {
          cohort: '2023-08',
          customers: 1150,
          retention: [1.00, 0.75, 0.61, 0.52, 0.46, 0.41]
        },
        {
          cohort: '2023-09',
          customers: 1250,
          retention: [1.00, 0.78, 0.64, 0.55, 0.49, 0.44]
        },
        {
          cohort: '2023-10',
          customers: 1320,
          retention: [1.00, 0.81, 0.67, 0.58, 0.52]
        },
        {
          cohort: '2023-11',
          customers: 1450,
          retention: [1.00, 0.83, 0.69, 0.61]
        },
        {
          cohort: '2023-12',
          customers: 1680,
          retention: [1.00, 0.85, 0.72]
        }
      ]
    },
    behaviorAnalysis: {
      purchaseFrequency: {
        weekly: 0.15,
        monthly: 0.45,
        quarterly: 0.25,
        yearly: 0.15
      },
      channelPreference: {
        online: 0.65,
        mobile: 0.25,
        inStore: 0.08,
        phone: 0.02
      },
      supportInteractions: {
        avgTickets: 2.3,
        resolutionRate: 0.87,
        satisfaction: 4.2,
        channels: {
          chat: 0.45,
          email: 0.35,
          phone: 0.18,
          selfService: 0.02
        }
      }
    },
    churnPrediction: {
      highRisk: 234,
      mediumRisk: 567,
      lowRisk: 8433,
      model: {
        accuracy: 0.89,
        precision: 0.84,
        recall: 0.91,
        features: [
          'Days since last purchase',
          'Support ticket frequency',
          'Order value trend',
          'Engagement score'
        ]
      }
    }
  },
  metadata: {
    version: '1.9.0',
    environment: 'development'
  }
};

// Financial Reporting Results
export const financialReportResults: ExecutionResults = {
  executionId: 'exec_finance_003',
  toolId: 'financial-report-generator',
  status: 'completed',
  startTime: new Date('2024-01-15T13:10:00Z'),
  endTime: new Date('2024-01-15T13:12:35.400Z'),
  duration: 155400,
  results: {
    type: 'financial_report',
    reportPeriod: {
      start: '2023-10-01',
      end: '2023-12-31',
      quarter: 'Q4 2023',
      fiscal_year: 'FY2023'
    },
    incomeStatement: {
      revenue: {
        gross: 15847532.00,
        net: 14562789.00,
        growth: 0.145
      },
      expenses: {
        cogs: 6234567.00,
        operating: 4567890.00,
        interest: 123456.00,
        taxes: 1234567.00,
        total: 12160480.00
      },
      profitability: {
        grossProfit: 9612965.00,
        grossMargin: 0.607,
        operatingProfit: 5045075.00,
        operatingMargin: 0.318,
        netProfit: 2402309.00,
        netMargin: 0.152,
        ebitda: 5987654.00,
        ebitdaMargin: 0.378
      }
    },
    balanceSheet: {
      assets: {
        current: {
          cash: 5678900.00,
          receivables: 3456789.00,
          inventory: 2345678.00,
          other: 567890.00,
          total: 12049257.00
        },
        fixed: {
          ppe: 8765432.00,
          intangible: 2345678.00,
          investments: 1234567.00,
          other: 654321.00,
          total: 12999998.00
        },
        total: 25049255.00
      },
      liabilities: {
        current: {
          payables: 2345678.00,
          accruals: 1234567.00,
          shortTermDebt: 987654.00,
          other: 432109.00,
          total: 5000008.00
        },
        longTerm: {
          longTermDebt: 6789012.00,
          other: 1210988.00,
          total: 8000000.00
        },
        total: 13000008.00
      },
      equity: {
        sharesOutstanding: 1000000,
        bookValuePerShare: 12.05,
        total: 12049247.00
      }
    },
    cashFlow: {
      operating: {
        netIncome: 2402309.00,
        depreciation: 876543.00,
        workingCapitalChange: -234567.00,
        other: 123456.00,
        total: 3167741.00
      },
      investing: {
        capex: -1234567.00,
        acquisitions: -567890.00,
        other: 98765.00,
        total: -1703692.00
      },
      financing: {
        debtChanges: 500000.00,
        dividends: -480462.00,
        shareRepurchase: -200000.00,
        other: -50000.00,
        total: -230462.00
      },
      netCashFlow: 1233587.00
    },
    ratios: {
      liquidity: {
        current: 2.41,
        quick: 1.88,
        cash: 1.14
      },
      efficiency: {
        assetTurnover: 0.63,
        inventoryTurnover: 2.66,
        receivablesTurnover: 4.21,
        payablesTurnover: 2.66
      },
      leverage: {
        debtToEquity: 1.08,
        debtToAssets: 0.52,
        interestCoverage: 41.1,
        debtServiceCoverage: 3.2
      },
      profitability: {
        roe: 0.199,
        roa: 0.096,
        roic: 0.201,
        grossMargin: 0.607,
        operatingMargin: 0.318,
        netMargin: 0.152
      }
    },
    variance: {
      revenueVsBudget: 0.087,
      expenseVsBudget: -0.034,
      profitVsBudget: 0.156,
      commentary: [
        'Revenue exceeded budget by 8.7% driven by strong Q4 performance',
        'Operating expenses came in 3.4% under budget due to cost optimization',
        'Net profit margin improved by 2.1 percentage points year-over-year'
      ]
    }
  },
  metadata: {
    version: '3.1.0',
    environment: 'development',
    preparationStandard: 'GAAP',
    auditStatus: 'Unaudited',
    compilationDate: '2024-01-15T13:12:35Z'
  }
};

// Inventory Management Results
export const inventoryAnalysisResults: ExecutionResults = {
  executionId: 'exec_inventory_004',
  toolId: 'inventory-optimizer',
  status: 'completed',
  startTime: new Date('2024-01-15T13:15:00Z'),
  endTime: new Date('2024-01-15T13:16:30.600Z'),
  duration: 90600,
  results: {
    type: 'inventory_analysis',
    summary: {
      totalSkus: 1247,
      totalValue: 4567890.00,
      averageTurnover: 6.8,
      stockoutRate: 0.023,
      excessStock: 234567.00,
      carryingCost: 456789.00
    },
    classification: {
      categoryA: { count: 125, percentage: 10, value: 2283945.00, turnover: 12.4 },
      categoryB: { count: 374, percentage: 30, value: 1370367.00, turnover: 8.2 },
      categoryC: { count: 748, percentage: 60, value: 913578.00, turnover: 3.1 }
    },
    topPerformers: [
      {
        sku: 'SKU_001',
        name: 'High-Demand Product A',
        currentStock: 1250,
        turnover: 24.5,
        value: 125000.00,
        daysSupply: 15,
        status: 'optimal'
      },
      {
        sku: 'SKU_002',
        name: 'Fast-Moving Product B',
        currentStock: 890,
        turnover: 18.7,
        value: 89000.00,
        daysSupply: 19,
        status: 'optimal'
      },
      {
        sku: 'SKU_003',
        name: 'Seasonal Product C',
        currentStock: 456,
        turnover: 15.2,
        value: 68400.00,
        daysSupply: 24,
        status: 'monitor'
      }
    ],
    slowMovers: [
      {
        sku: 'SKU_456',
        name: 'Slow Product X',
        currentStock: 1890,
        turnover: 0.8,
        value: 47250.00,
        daysSupply: 456,
        recommendedAction: 'clearance'
      },
      {
        sku: 'SKU_457',
        name: 'Obsolete Product Y',
        currentStock: 2340,
        turnover: 0.3,
        value: 35100.00,
        daysSupply: 1217,
        recommendedAction: 'liquidate'
      }
    ],
    stockouts: [
      {
        sku: 'SKU_789',
        name: 'Critical Component Z',
        demandForecast: 500,
        leadTime: 14,
        recommendedOrder: 750,
        urgency: 'critical'
      }
    ],
    optimization: {
      recommendations: [
        {
          category: 'Reorder Points',
          items: 45,
          potentialSavings: 123456.00,
          description: 'Adjust reorder points based on demand patterns'
        },
        {
          category: 'Safety Stock',
          items: 23,
          potentialSavings: 67890.00,
          description: 'Reduce safety stock for low-variability items'
        },
        {
          category: 'Order Quantities',
          items: 67,
          potentialSavings: 89012.00,
          description: 'Optimize order quantities using EOQ model'
        }
      ],
      totalPotentialSavings: 280358.00,
      implementationTimeframe: '90 days'
    },
    forecastAccuracy: {
      overall: 0.847,
      categoryA: 0.912,
      categoryB: 0.834,
      categoryC: 0.723,
      improvementActions: [
        'Implement machine learning for Category C forecasting',
        'Increase forecast frequency for high-velocity items',
        'Integrate external demand signals'
      ]
    }
  },
  metadata: {
    version: '2.7.0',
    environment: 'development'
  }
};

export const businessIntelligenceResults = {
  'sales-dashboard': {
    success: salesDashboardResults,
    error: {
      code: 'DATA_SOURCE_UNAVAILABLE',
      message: 'Sales data source is temporarily unavailable',
      details: { dataSource: 'CRM_API', lastSync: '2024-01-15T10:30:00Z' },
      retryable: true,
      timestamp: new Date()
    }
  },
  'customer-analytics': {
    success: customerAnalyticsResults,
    error: {
      code: 'INSUFFICIENT_CUSTOMER_DATA',
      message: 'Not enough customer data for meaningful analysis',
      details: { minCustomers: 1000, availableCustomers: 234 },
      retryable: false,
      timestamp: new Date()
    }
  },
  'financial-report-generator': {
    success: financialReportResults,
    error: {
      code: 'INCOMPLETE_FINANCIAL_DATA',
      message: 'Financial data is incomplete for the requested period',
      details: { missingPeriods: ['2023-11'], requiredPeriods: ['2023-10', '2023-11', '2023-12'] },
      retryable: true,
      timestamp: new Date()
    }
  },
  'inventory-optimizer': {
    success: inventoryAnalysisResults,
    error: {
      code: 'INVENTORY_SYSTEM_ERROR',
      message: 'Unable to connect to inventory management system',
      details: { system: 'WMS_ERP', status: 'maintenance', eta: '2024-01-15T15:00:00Z' },
      retryable: true,
      timestamp: new Date()
    }
  }
} as const;