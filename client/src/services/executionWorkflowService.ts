import { toolExecutionService } from './toolExecutionService';
import type { 
  ExecutionResults, 
  ExecutionState,
  ExecutionError 
} from '../types/execution';

export type WorkflowStatus = 'idle' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';

export interface ExecutionStep {
  id: string;
  toolId: string;
  inputs: Record<string, any>;
  dependsOn?: string[]; // Step IDs this step depends on
  condition?: string; // Conditional execution logic
  timeout?: number;
  retryCount?: number;
  maxRetries?: number;
  name?: string;
  description?: string;
}

export interface ExecutionStepResult {
  stepId: string;
  stepIndex: number;
  toolId: string;
  status: 'completed' | 'failed' | 'skipped';
  results?: ExecutionResults;
  error?: ExecutionError;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  retryCount: number;
}

export interface ExecutionWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: ExecutionStep[];
  status: WorkflowStatus;
  currentStepIndex: number;
  results: ExecutionStepResult[];
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecutionOptions {
  continueOnError?: boolean;
  parallelExecution?: boolean;
  maxConcurrentSteps?: number;
  timeout?: number;
  priority?: 'low' | 'normal' | 'high';
}

export interface ExecutionQueue {
  id: string;
  workflowId: string;
  priority: number;
  addedAt: Date;
  estimatedDuration?: number;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
}

export class ExecutionWorkflowService {
  private workflows: Map<string, ExecutionWorkflow> = new Map();
  private executionQueue: ExecutionQueue[] = [];
  private isProcessing = false;
  private maxConcurrentWorkflows = 3;
  private runningWorkflows = new Set<string>();

  /**
   * Create a new workflow
   */
  async createWorkflow(
    name: string,
    steps: Omit<ExecutionStep, 'id'>[],
    options: {
      description?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<ExecutionWorkflow> {
    const workflow: ExecutionWorkflow = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: options.description,
      steps: steps.map((step, index) => ({
        ...step,
        id: `step_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      })),
      status: 'idle',
      currentStepIndex: 0,
      results: [],
      metadata: options.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    options: WorkflowExecutionOptions = {}
  ): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Add to execution queue
    const queueItem: ExecutionQueue = {
      id: `queue_${Date.now()}`,
      workflowId,
      priority: this.getPriorityValue(options.priority || 'normal'),
      addedAt: new Date(),
      status: 'queued',
    };

    this.executionQueue.push(queueItem);
    this.executionQueue.sort((a, b) => b.priority - a.priority);

    // Start processing queue
    this.processQueue();
  }

  /**
   * Process the execution queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.runningWorkflows.size >= this.maxConcurrentWorkflows) {
      return;
    }

    this.isProcessing = true;

    while (this.executionQueue.length > 0 && this.runningWorkflows.size < this.maxConcurrentWorkflows) {
      const queueItem = this.executionQueue.shift();
      if (!queueItem || queueItem.status !== 'queued') continue;

      const workflow = this.workflows.get(queueItem.workflowId);
      if (!workflow) continue;

      queueItem.status = 'running';
      this.runningWorkflows.add(queueItem.workflowId);

      // Execute workflow in background
      this.executeWorkflowSteps(workflow)
        .then(() => {
          queueItem.status = 'completed';
        })
        .catch((error) => {
          queueItem.status = 'failed';
          console.error('Workflow execution failed:', error);
        })
        .finally(() => {
          this.runningWorkflows.delete(queueItem.workflowId);
          // Continue processing queue
          setTimeout(() => this.processQueue(), 100);
        });
    }

    this.isProcessing = false;
  }

  /**
   * Execute workflow steps
   */
  private async executeWorkflowSteps(
    workflow: ExecutionWorkflow,
    options: WorkflowExecutionOptions = {}
  ): Promise<void> {
    workflow.status = 'running';
    workflow.startTime = new Date();
    workflow.updatedAt = new Date();

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        workflow.currentStepIndex = i;
        const step = workflow.steps[i];

        // Check if workflow was cancelled
        if (workflow.status === 'cancelled') {
          break;
        }

        // Check dependencies
        if (step.dependsOn && step.dependsOn.length > 0) {
          const dependenciesMet = this.checkDependencies(step.dependsOn, workflow.results);
          if (!dependenciesMet) {
            const error: ExecutionError = {
              code: 'DEPENDENCY_FAILED',
              message: `Dependencies not met for step ${step.id}`,
              retryable: false,
            };

            const stepResult: ExecutionStepResult = {
              stepId: step.id,
              stepIndex: i,
              toolId: step.toolId,
              status: 'failed',
              error,
              startTime: new Date(),
              endTime: new Date(),
              retryCount: 0,
            };

            workflow.results.push(stepResult);

            if (!options.continueOnError) {
              throw new Error(`Dependencies not met for step ${step.id}`);
            }
            continue;
          }
        }

        // Check conditional execution
        if (step.condition) {
          const shouldExecute = this.evaluateCondition(step.condition, workflow.results);
          if (!shouldExecute) {
            const stepResult: ExecutionStepResult = {
              stepId: step.id,
              stepIndex: i,
              toolId: step.toolId,
              status: 'skipped',
              startTime: new Date(),
              endTime: new Date(),
              retryCount: 0,
            };

            workflow.results.push(stepResult);
            continue;
          }
        }

        // Execute step with retries
        await this.executeStepWithRetries(step, workflow, options);
      }

      workflow.status = 'completed';
      workflow.endTime = new Date();
      workflow.duration = workflow.endTime.getTime() - (workflow.startTime?.getTime() || 0);

    } catch (error) {
      workflow.status = 'failed';
      workflow.endTime = new Date();
      workflow.duration = workflow.endTime.getTime() - (workflow.startTime?.getTime() || 0);
      throw error;
    } finally {
      workflow.updatedAt = new Date();
    }
  }

  /**
   * Execute a step with retry logic
   */
  private async executeStepWithRetries(
    step: ExecutionStep,
    workflow: ExecutionWorkflow,
    options: WorkflowExecutionOptions
  ): Promise<void> {
    const maxRetries = step.maxRetries || 3;
    let retryCount = 0;
    let lastError: ExecutionError | undefined;

    while (retryCount <= maxRetries) {
      try {
        const stepResult = await this.executeStep(step, workflow.results, retryCount);
        workflow.results.push(stepResult);
        return;
      } catch (error) {
        retryCount++;
        lastError = error as ExecutionError;

        if (retryCount > maxRetries || !lastError.retryable) {
          const stepResult: ExecutionStepResult = {
            stepId: step.id,
            stepIndex: workflow.currentStepIndex,
            toolId: step.toolId,
            status: 'failed',
            error: lastError,
            startTime: new Date(),
            endTime: new Date(),
            retryCount,
          };

          workflow.results.push(stepResult);

          if (!options.continueOnError) {
            throw error;
          }
          return;
        }

        // Wait before retry with exponential backoff
        const delay = Math.pow(2, retryCount - 1) * 1000; // 1s, 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    step: ExecutionStep,
    previousResults: ExecutionStepResult[],
    retryCount: number
  ): Promise<ExecutionStepResult> {
    const startTime = new Date();

    try {
      // Resolve dynamic inputs from previous results
      const resolvedInputs = this.resolveInputs(step.inputs, previousResults);

      // Execute the tool
      const response = await toolExecutionService.executeTool(step.toolId, resolvedInputs);

      // Poll for completion with timeout
      const timeout = step.timeout || 300000; // 5 minutes default
      const results = await toolExecutionService.pollForCompletion(response.executionId, {
        maxAttempts: Math.floor(timeout / 1000),
        intervalMs: 1000,
      });

      const endTime = new Date();

      return {
        stepId: step.id,
        stepIndex: 0, // Will be set by caller
        toolId: step.toolId,
        status: 'completed',
        results,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        retryCount,
      };

    } catch (error) {
      const endTime = new Date();
      const executionError = error as ExecutionError;

      return {
        stepId: step.id,
        stepIndex: 0, // Will be set by caller
        toolId: step.toolId,
        status: 'failed',
        error: executionError,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        retryCount,
      };
    }
  }

  /**
   * Resolve dynamic inputs from previous step results
   */
  private resolveInputs(
    inputs: Record<string, any>,
    previousResults: ExecutionStepResult[]
  ): Record<string, any> {
    const resolved = { ...inputs };

    for (const [key, value] of Object.entries(resolved)) {
      if (typeof value === 'string' && value.startsWith('${')) {
        // Dynamic input resolution: ${stepId.outputKey}
        const reference = value.slice(2, -1); // Remove ${ }
        resolved[key] = this.resolveReference(reference, previousResults);
      }
    }

    return resolved;
  }

  /**
   * Resolve a reference to previous step output
   */
  private resolveReference(reference: string, previousResults: ExecutionStepResult[]): any {
    const [stepId, ...outputPath] = reference.split('.');
    
    const stepResult = previousResults.find(result => 
      result.stepId === stepId && result.status === 'completed'
    );

    if (!stepResult || !stepResult.results) {
      throw new Error(`Cannot resolve reference to ${stepId}: step not found or failed`);
    }

    let value = stepResult.results.results;
    
    // Navigate the output path
    for (const key of outputPath) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        throw new Error(`Cannot resolve reference ${reference}: path not found`);
      }
    }

    return value;
  }

  /**
   * Check if dependencies are satisfied
   */
  private checkDependencies(
    dependsOn: string[],
    results: ExecutionStepResult[]
  ): boolean {
    return dependsOn.every(stepId => 
      results.some(result => 
        result.stepId === stepId && result.status === 'completed'
      )
    );
  }

  /**
   * Evaluate conditional execution
   */
  private evaluateCondition(
    condition: string,
    previousResults: ExecutionStepResult[]
  ): boolean {
    // Simple condition evaluation (can be enhanced with proper expression parser)
    try {
      // Replace step references with actual values
      let evaluableCondition = condition;
      
      // Find all references like ${stepId.path}
      const references = condition.match(/\$\{[^}]+\}/g) || [];
      
      for (const ref of references) {
        const reference = ref.slice(2, -1);
        try {
          const value = this.resolveReference(reference, previousResults);
          evaluableCondition = evaluableCondition.replace(ref, JSON.stringify(value));
        } catch (error) {
          // If reference cannot be resolved, condition fails
          return false;
        }
      }

      // Basic evaluation (in production, use a proper expression evaluator)
      return eval(evaluableCondition);
    } catch (error) {
      console.error('Failed to evaluate condition:', condition, error);
      return false;
    }
  }

  /**
   * Get priority value for sorting
   */
  private getPriorityValue(priority: 'low' | 'normal' | 'high'): number {
    switch (priority) {
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }

  /**
   * Cancel a workflow
   */
  async cancelWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    workflow.status = 'cancelled';
    workflow.endTime = new Date();
    workflow.updatedAt = new Date();

    // Remove from queue if queued
    const queueIndex = this.executionQueue.findIndex(item => item.workflowId === workflowId);
    if (queueIndex !== -1) {
      this.executionQueue[queueIndex].status = 'cancelled';
    }

    // Remove from running workflows
    this.runningWorkflows.delete(workflowId);
  }

  /**
   * Pause a workflow
   */
  async pauseWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (workflow.status === 'running') {
      workflow.status = 'paused';
      workflow.updatedAt = new Date();
    }
  }

  /**
   * Resume a workflow
   */
  async resumeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (workflow.status === 'paused') {
      workflow.status = 'running';
      workflow.updatedAt = new Date();
      
      // Add back to queue
      const queueItem: ExecutionQueue = {
        id: `queue_${Date.now()}`,
        workflowId,
        priority: this.getPriorityValue('normal'),
        addedAt: new Date(),
        status: 'queued',
      };

      this.executionQueue.push(queueItem);
      this.processQueue();
    }
  }

  /**
   * Get workflow status
   */
  getWorkflow(workflowId: string): ExecutionWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): ExecutionWorkflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get execution queue status
   */
  getQueueStatus(): {
    queued: ExecutionQueue[];
    running: ExecutionQueue[];
    total: number;
  } {
    const queued = this.executionQueue.filter(item => item.status === 'queued');
    const running = this.executionQueue.filter(item => item.status === 'running');
    
    return {
      queued,
      running,
      total: this.executionQueue.length,
    };
  }

  /**
   * Delete a workflow
   */
  deleteWorkflow(workflowId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    // Cancel if running
    if (workflow.status === 'running') {
      this.cancelWorkflow(workflowId);
    }

    return this.workflows.delete(workflowId);
  }
}

// Singleton instance
export const executionWorkflowService = new ExecutionWorkflowService();