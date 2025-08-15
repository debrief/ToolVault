import type { 
  ExecutionState, 
  ExecutionResults,
  ExecutionError,
  ExecutionErrorCode 
} from '../types/execution';

export interface ExecutionMetrics {
  toolId: string;
  executionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: string;
  inputSize: number;
  outputSize?: number;
  errorType?: string;
  userId?: string;
  timestamp: Date;
  metadata?: {
    browserInfo?: string;
    performanceMetrics?: {
      cpuUsage?: number;
      memoryUsage?: number;
      networkLatency?: number;
    };
    inputTypes?: Record<string, string>;
    outputTypes?: Record<string, string>;
  };
}

export interface ToolAnalytics {
  toolId: string;
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  popularInputs: Array<{
    input: string;
    frequency: number;
    averageValue: any;
  }>;
  errorPatterns: Array<{
    errorCode: string;
    frequency: number;
    averageRecoveryTime?: number;
  }>;
  usageOverTime: Array<{
    date: string;
    executions: number;
    successRate: number;
  }>;
  performanceTrends: {
    durationTrend: Array<{ date: string; averageDuration: number }>;
    errorRateTrend: Array<{ date: string; errorRate: number }>;
  };
  userSegmentation: Array<{
    segment: string;
    usage: number;
    successRate: number;
  }>;
}

export interface ExecutionReport {
  executionId: string;
  summary: {
    status: string;
    duration: number;
    efficiency: number;
    resourceUsage: number;
  };
  performance: {
    cpuUsage: number[];
    memoryUsage: number[];
    networkLatency: number[];
    recommendations: string[];
  };
  comparison: {
    vsAverage: {
      duration: number;
      successRate: number;
    };
    similarExecutions: Array<{
      executionId: string;
      similarity: number;
      duration: number;
    }>;
  };
  recommendations: string[];
}

export interface UserFeedback {
  executionId: string;
  rating: number;
  feedback: string;
  reportIssue: boolean;
  categories: string[];
  timestamp: Date;
  userId?: string;
  additionalMetrics?: {
    wouldRecommend?: boolean;
    executionSpeed?: number;
    resultQuality?: number;
    suggestions?: string;
  };
}

export interface AnalyticsFilter {
  toolIds?: string[];
  startDate?: Date;
  endDate?: Date;
  status?: string[];
  userId?: string;
  minDuration?: number;
  maxDuration?: number;
}

export class ExecutionAnalyticsService {
  private metrics: Map<string, ExecutionMetrics[]> = new Map();
  private feedback: Map<string, UserFeedback> = new Map();
  private alertThresholds = {
    errorRateThreshold: 0.15, // 15%
    slowExecutionThreshold: 30000, // 30 seconds
    memoryUsageThreshold: 100 * 1024 * 1024, // 100MB
  };

  /**
   * Record execution metrics
   */
  recordExecution(
    toolId: string,
    inputs: Record<string, any>,
    execution: ExecutionState
  ): void {
    const metric: ExecutionMetrics = {
      toolId,
      executionId: execution.id,
      startTime: execution.startTime,
      endTime: execution.endTime,
      duration: execution.duration,
      status: execution.status,
      inputSize: this.calculateInputSize(inputs),
      outputSize: execution.results ? this.calculateOutputSize(execution.results) : undefined,
      errorType: execution.error?.code,
      userId: this.getCurrentUserId(),
      timestamp: new Date(),
      metadata: {
        browserInfo: navigator.userAgent,
        performanceMetrics: execution.metadata?.performanceMetrics,
        inputTypes: this.analyzeInputTypes(inputs),
        outputTypes: execution.results ? this.analyzeOutputTypes(execution.results) : undefined,
      },
    };

    const toolMetrics = this.metrics.get(toolId) || [];
    toolMetrics.push(metric);
    this.metrics.set(toolId, toolMetrics);

    // Send to analytics backend (if available)
    this.sendToAnalytics(metric);

    // Check for performance alerts
    this.checkPerformanceAlerts(metric);
  }

  /**
   * Record user feedback
   */
  recordFeedback(feedback: UserFeedback): void {
    this.feedback.set(feedback.executionId, feedback);

    // Send to analytics backend
    this.sendFeedbackToAnalytics(feedback);

    // Update tool ratings
    this.updateToolRatings(feedback);
  }

  /**
   * Get comprehensive tool analytics
   */
  getToolAnalytics(toolId: string, filter?: AnalyticsFilter): ToolAnalytics {
    const metrics = this.getFilteredMetrics(toolId, filter);

    if (metrics.length === 0) {
      return this.getEmptyAnalytics(toolId);
    }

    return {
      toolId,
      totalExecutions: metrics.length,
      successRate: this.calculateSuccessRate(metrics),
      averageDuration: this.calculateAverageDuration(metrics),
      popularInputs: this.identifyPopularInputs(metrics),
      errorPatterns: this.analyzeErrorPatterns(metrics),
      usageOverTime: this.generateUsageTimeline(metrics),
      performanceTrends: this.analyzePerformanceTrends(metrics),
      userSegmentation: this.analyzeUserSegmentation(metrics),
    };
  }

  /**
   * Generate detailed execution report
   */
  generateExecutionReport(executionId: string): ExecutionReport {
    const metric = this.findMetricByExecutionId(executionId);
    if (!metric) {
      throw new Error('Execution metrics not found');
    }

    const toolMetrics = this.metrics.get(metric.toolId) || [];

    return {
      executionId,
      summary: this.generateSummary(metric),
      performance: this.analyzePerformance(metric, toolMetrics),
      comparison: this.generateComparison(metric, toolMetrics),
      recommendations: this.generateRecommendations(metric, toolMetrics),
    };
  }

  /**
   * Get aggregated analytics across all tools
   */
  getGlobalAnalytics(filter?: AnalyticsFilter): {
    totalExecutions: number;
    uniqueTools: number;
    overallSuccessRate: number;
    averageDuration: number;
    topTools: Array<{ toolId: string; usage: number; successRate: number }>;
    errorDistribution: Array<{ errorCode: string; frequency: number }>;
    performanceMetrics: {
      p50Duration: number;
      p95Duration: number;
      p99Duration: number;
    };
  } {
    let allMetrics: ExecutionMetrics[] = [];
    
    for (const toolMetrics of this.metrics.values()) {
      allMetrics = allMetrics.concat(toolMetrics);
    }

    if (filter) {
      allMetrics = this.applyFilter(allMetrics, filter);
    }

    const durations = allMetrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!)
      .sort((a, b) => a - b);

    return {
      totalExecutions: allMetrics.length,
      uniqueTools: new Set(allMetrics.map(m => m.toolId)).size,
      overallSuccessRate: this.calculateSuccessRate(allMetrics),
      averageDuration: this.calculateAverageDuration(allMetrics),
      topTools: this.getTopTools(allMetrics),
      errorDistribution: this.getErrorDistribution(allMetrics),
      performanceMetrics: {
        p50Duration: durations[Math.floor(durations.length * 0.5)] || 0,
        p95Duration: durations[Math.floor(durations.length * 0.95)] || 0,
        p99Duration: durations[Math.floor(durations.length * 0.99)] || 0,
      },
    };
  }

  /**
   * Get user feedback analytics
   */
  getUserFeedbackAnalytics(): {
    totalFeedback: number;
    averageRating: number;
    ratingDistribution: Array<{ rating: number; count: number }>;
    commonIssues: Array<{ category: string; frequency: number }>;
    recommendations: Array<{ suggestion: string; frequency: number }>;
  } {
    const feedbackArray = Array.from(this.feedback.values());

    const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: feedbackArray.filter(f => f.rating === rating).length,
    }));

    const categoryFrequency = new Map<string, number>();
    feedbackArray.forEach(feedback => {
      feedback.categories.forEach(category => {
        categoryFrequency.set(category, (categoryFrequency.get(category) || 0) + 1);
      });
    });

    const suggestionFrequency = new Map<string, number>();
    feedbackArray.forEach(feedback => {
      if (feedback.additionalMetrics?.suggestions) {
        suggestionFrequency.set(
          feedback.additionalMetrics.suggestions,
          (suggestionFrequency.get(feedback.additionalMetrics.suggestions) || 0) + 1
        );
      }
    });

    return {
      totalFeedback: feedbackArray.length,
      averageRating: feedbackArray.reduce((sum, f) => sum + f.rating, 0) / feedbackArray.length || 0,
      ratingDistribution: ratingCounts,
      commonIssues: Array.from(categoryFrequency.entries())
        .map(([category, frequency]) => ({ category, frequency }))
        .sort((a, b) => b.frequency - a.frequency),
      recommendations: Array.from(suggestionFrequency.entries())
        .map(([suggestion, frequency]) => ({ suggestion, frequency }))
        .sort((a, b) => b.frequency - a.frequency),
    };
  }

  // Private helper methods

  private calculateInputSize(inputs: Record<string, any>): number {
    return JSON.stringify(inputs).length;
  }

  private calculateOutputSize(results: ExecutionResults): number {
    return JSON.stringify(results.results).length;
  }

  private analyzeInputTypes(inputs: Record<string, any>): Record<string, string> {
    const types: Record<string, string> = {};
    for (const [key, value] of Object.entries(inputs)) {
      types[key] = typeof value;
    }
    return types;
  }

  private analyzeOutputTypes(results: ExecutionResults): Record<string, string> {
    const types: Record<string, string> = {};
    if (results.results && typeof results.results === 'object') {
      for (const [key, value] of Object.entries(results.results)) {
        types[key] = typeof value;
      }
    }
    return types;
  }

  private getCurrentUserId(): string | undefined {
    // In a real implementation, get from authentication context
    return localStorage.getItem('userId') || undefined;
  }

  private sendToAnalytics(metric: ExecutionMetrics): void {
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.debug('Analytics metric:', metric);
    }
  }

  private sendFeedbackToAnalytics(feedback: UserFeedback): void {
    // In production, send to feedback service
    if (process.env.NODE_ENV === 'development') {
      console.debug('User feedback:', feedback);
    }
  }

  private checkPerformanceAlerts(metric: ExecutionMetrics): void {
    const alerts: string[] = [];

    // Check execution duration
    if (metric.duration && metric.duration > this.alertThresholds.slowExecutionThreshold) {
      alerts.push(`Slow execution detected: ${metric.duration}ms`);
    }

    // Check memory usage
    if (metric.metadata?.performanceMetrics?.memoryUsage) {
      const memoryUsage = metric.metadata.performanceMetrics.memoryUsage * 1024 * 1024;
      if (memoryUsage > this.alertThresholds.memoryUsageThreshold) {
        alerts.push(`High memory usage: ${Math.round(memoryUsage / 1024 / 1024)}MB`);
      }
    }

    // Check error rate for tool
    const toolMetrics = this.metrics.get(metric.toolId) || [];
    const recentMetrics = toolMetrics.slice(-10); // Last 10 executions
    const errorRate = recentMetrics.filter(m => m.status === 'failed').length / recentMetrics.length;
    
    if (errorRate > this.alertThresholds.errorRateThreshold) {
      alerts.push(`High error rate detected: ${Math.round(errorRate * 100)}%`);
    }

    if (alerts.length > 0) {
      console.warn(`Performance alerts for ${metric.toolId}:`, alerts);
    }
  }

  private updateToolRatings(feedback: UserFeedback): void {
    // Update tool ratings based on feedback
    // In production, this would update a database
    const key = `tool_rating_${feedback.executionId}`;
    localStorage.setItem(key, JSON.stringify({
      rating: feedback.rating,
      timestamp: feedback.timestamp,
    }));
  }

  private calculateSuccessRate(metrics: ExecutionMetrics[]): number {
    if (metrics.length === 0) return 0;
    const successful = metrics.filter(m => m.status === 'completed').length;
    return successful / metrics.length;
  }

  private calculateAverageDuration(metrics: ExecutionMetrics[]): number {
    const durationsMs = metrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!);
    
    if (durationsMs.length === 0) return 0;
    return durationsMs.reduce((sum, d) => sum + d, 0) / durationsMs.length;
  }

  private identifyPopularInputs(metrics: ExecutionMetrics[]): Array<{
    input: string;
    frequency: number;
    averageValue: any;
  }> {
    // This would need to be implemented based on actual input analysis
    // For now, return empty array
    return [];
  }

  private analyzeErrorPatterns(metrics: ExecutionMetrics[]): Array<{
    errorCode: string;
    frequency: number;
    averageRecoveryTime?: number;
  }> {
    const errorCounts = new Map<string, number>();
    
    metrics.filter(m => m.errorType).forEach(m => {
      const count = errorCounts.get(m.errorType!) || 0;
      errorCounts.set(m.errorType!, count + 1);
    });

    return Array.from(errorCounts.entries())
      .map(([errorCode, frequency]) => ({ errorCode, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  private generateUsageTimeline(metrics: ExecutionMetrics[]): Array<{
    date: string;
    executions: number;
    successRate: number;
  }> {
    const dailyStats = new Map<string, { total: number; successful: number }>();

    metrics.forEach(metric => {
      const date = metric.startTime.toISOString().split('T')[0];
      const stats = dailyStats.get(date) || { total: 0, successful: 0 };
      
      stats.total++;
      if (metric.status === 'completed') {
        stats.successful++;
      }
      
      dailyStats.set(date, stats);
    });

    return Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        executions: stats.total,
        successRate: stats.successful / stats.total,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private analyzePerformanceTrends(metrics: ExecutionMetrics[]): {
    durationTrend: Array<{ date: string; averageDuration: number }>;
    errorRateTrend: Array<{ date: string; errorRate: number }>;
  } {
    const dailyPerformance = new Map<string, {
      durations: number[];
      total: number;
      errors: number;
    }>();

    metrics.forEach(metric => {
      const date = metric.startTime.toISOString().split('T')[0];
      const perf = dailyPerformance.get(date) || { durations: [], total: 0, errors: 0 };
      
      perf.total++;
      if (metric.duration) {
        perf.durations.push(metric.duration);
      }
      if (metric.status === 'failed') {
        perf.errors++;
      }
      
      dailyPerformance.set(date, perf);
    });

    const durationTrend = Array.from(dailyPerformance.entries())
      .map(([date, perf]) => ({
        date,
        averageDuration: perf.durations.length > 0
          ? perf.durations.reduce((sum, d) => sum + d, 0) / perf.durations.length
          : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const errorRateTrend = Array.from(dailyPerformance.entries())
      .map(([date, perf]) => ({
        date,
        errorRate: perf.total > 0 ? perf.errors / perf.total : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { durationTrend, errorRateTrend };
  }

  private analyzeUserSegmentation(metrics: ExecutionMetrics[]): Array<{
    segment: string;
    usage: number;
    successRate: number;
  }> {
    // This would segment users based on usage patterns
    // For now, return basic segmentation
    return [
      { segment: 'Power Users', usage: 50, successRate: 0.95 },
      { segment: 'Regular Users', usage: 30, successRate: 0.85 },
      { segment: 'New Users', usage: 20, successRate: 0.75 },
    ];
  }

  private getFilteredMetrics(toolId: string, filter?: AnalyticsFilter): ExecutionMetrics[] {
    let metrics = this.metrics.get(toolId) || [];
    
    if (filter) {
      metrics = this.applyFilter(metrics, filter);
    }
    
    return metrics;
  }

  private applyFilter(metrics: ExecutionMetrics[], filter: AnalyticsFilter): ExecutionMetrics[] {
    return metrics.filter(metric => {
      if (filter.startDate && metric.startTime < filter.startDate) return false;
      if (filter.endDate && metric.startTime > filter.endDate) return false;
      if (filter.status && !filter.status.includes(metric.status)) return false;
      if (filter.userId && metric.userId !== filter.userId) return false;
      if (filter.minDuration && (!metric.duration || metric.duration < filter.minDuration)) return false;
      if (filter.maxDuration && (!metric.duration || metric.duration > filter.maxDuration)) return false;
      
      return true;
    });
  }

  private getEmptyAnalytics(toolId: string): ToolAnalytics {
    return {
      toolId,
      totalExecutions: 0,
      successRate: 0,
      averageDuration: 0,
      popularInputs: [],
      errorPatterns: [],
      usageOverTime: [],
      performanceTrends: { durationTrend: [], errorRateTrend: [] },
      userSegmentation: [],
    };
  }

  private findMetricByExecutionId(executionId: string): ExecutionMetrics | undefined {
    for (const metrics of this.metrics.values()) {
      const metric = metrics.find(m => m.executionId === executionId);
      if (metric) return metric;
    }
    return undefined;
  }

  private generateSummary(metric: ExecutionMetrics): ExecutionReport['summary'] {
    return {
      status: metric.status,
      duration: metric.duration || 0,
      efficiency: this.calculateEfficiency(metric),
      resourceUsage: this.calculateResourceUsage(metric),
    };
  }

  private calculateEfficiency(metric: ExecutionMetrics): number {
    // Calculate efficiency score based on duration vs input size
    if (!metric.duration || metric.inputSize === 0) return 0;
    return Math.max(0, 100 - (metric.duration / metric.inputSize));
  }

  private calculateResourceUsage(metric: ExecutionMetrics): number {
    if (!metric.metadata?.performanceMetrics) return 0;
    const { memoryUsage = 0, cpuUsage = 0 } = metric.metadata.performanceMetrics;
    return (memoryUsage + cpuUsage) / 2;
  }

  private analyzePerformance(metric: ExecutionMetrics, toolMetrics: ExecutionMetrics[]): ExecutionReport['performance'] {
    return {
      cpuUsage: [metric.metadata?.performanceMetrics?.cpuUsage || 0],
      memoryUsage: [metric.metadata?.performanceMetrics?.memoryUsage || 0],
      networkLatency: [metric.metadata?.performanceMetrics?.networkLatency || 0],
      recommendations: this.getPerformanceRecommendations(metric),
    };
  }

  private getPerformanceRecommendations(metric: ExecutionMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metric.duration && metric.duration > 10000) {
      recommendations.push('Consider reducing input data size for faster execution');
    }
    
    if (metric.metadata?.performanceMetrics?.memoryUsage && metric.metadata.performanceMetrics.memoryUsage > 50) {
      recommendations.push('High memory usage detected - consider data streaming approach');
    }
    
    return recommendations;
  }

  private generateComparison(metric: ExecutionMetrics, toolMetrics: ExecutionMetrics[]): ExecutionReport['comparison'] {
    const avgDuration = this.calculateAverageDuration(toolMetrics);
    const successRate = this.calculateSuccessRate(toolMetrics);
    
    return {
      vsAverage: {
        duration: metric.duration ? (metric.duration - avgDuration) / avgDuration : 0,
        successRate: metric.status === 'completed' ? 1 - successRate : -successRate,
      },
      similarExecutions: [], // Would implement similarity calculation
    };
  }

  private generateRecommendations(metric: ExecutionMetrics, toolMetrics: ExecutionMetrics[]): string[] {
    const recommendations: string[] = [];
    
    if (metric.status === 'failed') {
      recommendations.push('Review input parameters and try again');
    }
    
    if (metric.duration && metric.duration > this.calculateAverageDuration(toolMetrics) * 2) {
      recommendations.push('This execution took longer than usual - consider optimizing inputs');
    }
    
    return recommendations;
  }

  private getTopTools(metrics: ExecutionMetrics[]): Array<{ toolId: string; usage: number; successRate: number }> {
    const toolStats = new Map<string, { total: number; successful: number }>();
    
    metrics.forEach(metric => {
      const stats = toolStats.get(metric.toolId) || { total: 0, successful: 0 };
      stats.total++;
      if (metric.status === 'completed') {
        stats.successful++;
      }
      toolStats.set(metric.toolId, stats);
    });
    
    return Array.from(toolStats.entries())
      .map(([toolId, stats]) => ({
        toolId,
        usage: stats.total,
        successRate: stats.successful / stats.total,
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);
  }

  private getErrorDistribution(metrics: ExecutionMetrics[]): Array<{ errorCode: string; frequency: number }> {
    const errorCounts = new Map<string, number>();
    
    metrics.filter(m => m.errorType).forEach(m => {
      const count = errorCounts.get(m.errorType!) || 0;
      errorCounts.set(m.errorType!, count + 1);
    });
    
    return Array.from(errorCounts.entries())
      .map(([errorCode, frequency]) => ({ errorCode, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  }
}

// Singleton instance
export const executionAnalyticsService = new ExecutionAnalyticsService();