# APM Task Assignment: Tool Execution Integration

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 4, Task 4.4** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Wire tool execution flow from input to output display, connecting the ExecutionPanel with real functionality, workflow management, and comprehensive user feedback.

**Prerequisites:** Tasks 4.1-4.3 completed - Mock backend service, enhanced search/filtering, and output rendering components should be operational.

## 2. Detailed Action Steps

1. **Enhance ExecutionPanel with Real Functionality:**
   - Connect input forms to execution service:
     ```typescript
     // src/components/tools/EnhancedExecutionPanel.tsx
     export interface ExecutionPanelProps {
       tool: Tool;
       onExecutionComplete?: (results: ExecutionResults) => void;
       onExecutionError?: (error: ExecutionError) => void;
     }
     
     export function EnhancedExecutionPanel({ 
       tool, 
       onExecutionComplete,
       onExecutionError 
     }: ExecutionPanelProps) {
       const [inputValues, setInputValues] = useState<Record<string, any>>({});
       const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
       const [execution, setExecution] = useState<ExecutionState | null>(null);
       const [results, setResults] = useState<ExecutionResults | null>(null);
       
       const { executeToool, getExecutionStatus, cancelExecution } = useToolExecution();
       const { showNotification } = useNotification();
       
       // Real-time execution progress polling
       useEffect(() => {
         if (execution?.status === 'running') {
           const interval = setInterval(async () => {
             try {
               const status = await getExecutionStatus(execution.id);
               setExecution(status);
               
               if (status.status === 'completed') {
                 setResults(status.results);
                 onExecutionComplete?.(status.results);
                 showNotification('Tool execution completed successfully', 'success');
               } else if (status.status === 'failed') {
                 onExecutionError?.(status.error);
                 showNotification(status.error.message, 'error');
               }
             } catch (error) {
               console.error('Failed to get execution status:', error);
             }
           }, 1000);
           
           return () => clearInterval(interval);
         }
       }, [execution?.status, execution?.id]);
       
       const handleInputChange = (inputName: string, value: any) => {
         setInputValues(prev => ({ ...prev, [inputName]: value }));
         
         // Clear validation error when user types
         if (validationErrors[inputName]) {
           setValidationErrors(prev => {
             const newErrors = { ...prev };
             delete newErrors[inputName];
             return newErrors;
           });
         }
       };
       
       const validateInputs = (): boolean => {
         const errors: Record<string, string> = {};
         
         for (const input of tool.inputs) {
           const value = inputValues[input.name];
           const validation = validateToolInput(input, value);
           
           if (!validation.isValid) {
             errors[input.name] = validation.errors[input.name];
           }
         }
         
         setValidationErrors(errors);
         return Object.keys(errors).length === 0;
       };
       
       const handleExecute = async () => {
         if (!validateInputs()) {
           showNotification('Please fix validation errors before executing', 'warning');
           return;
         }
         
         try {
           const executionResponse = await executeToool(tool.id, inputValues);
           setExecution({
             id: executionResponse.executionId,
             status: 'running',
             progress: 0,
             startTime: new Date(),
           });
           
           showNotification('Tool execution started', 'info');
         } catch (error) {
           onExecutionError?.(error as ExecutionError);
           showNotification('Failed to start execution', 'error');
         }
       };
       
       const handleCancel = async () => {
         if (execution && execution.status === 'running') {
           try {
             await cancelExecution(execution.id);
             setExecution(prev => prev ? { ...prev, status: 'cancelled' } : null);
             showNotification('Execution cancelled', 'info');
           } catch (error) {
             showNotification('Failed to cancel execution', 'error');
           }
         }
       };
       
       return (
         <Card>
           <CardHeader
             title="Tool Execution"
             subheader={`Configure inputs and execute ${tool.name}`}
           />
           <CardContent>
             {/* Input Forms */}
             <ExecutionInputs
               inputs={tool.inputs}
               values={inputValues}
               errors={validationErrors}
               onChange={handleInputChange}
               disabled={execution?.status === 'running'}
             />
             
             {/* Execution Controls */}
             <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
               <Button
                 variant="contained"
                 onClick={handleExecute}
                 disabled={execution?.status === 'running'}
                 startIcon={<PlayArrowIcon />}
               >
                 Execute Tool
               </Button>
               
               {execution?.status === 'running' && (
                 <Button
                   variant="outlined"
                   onClick={handleCancel}
                   startIcon={<StopIcon />}
                   color="error"
                 >
                   Cancel
                 </Button>
               )}
               
               <Button
                 variant="text"
                 onClick={() => {
                   setInputValues({});
                   setValidationErrors({});
                   setExecution(null);
                   setResults(null);
                 }}
                 startIcon={<RefreshIcon />}
               >
                 Reset
               </Button>
             </Box>
             
             {/* Execution Progress */}
             {execution && (
               <ExecutionProgress
                 execution={execution}
                 sx={{ mt: 2 }}
               />
             )}
             
             {/* Results Display */}
             {results && (
               <Box sx={{ mt: 3 }}>
                 <Divider sx={{ mb: 2 }} />
                 <Typography variant="h6" gutterBottom>
                   Execution Results
                 </Typography>
                 <OutputRenderer
                   data={results.data}
                   metadata={results.metadata}
                   title={`${tool.name} Results`}
                   interactive
                 />
               </Box>
             )}
           </CardContent>
         </Card>
       );
     }
     ```

2. **Create Execution Workflow Management:**
   - Implement execution queuing and batch processing:
     ```typescript
     // src/services/executionWorkflowService.ts
     export interface ExecutionWorkflow {
       id: string;
       name: string;
       tools: ExecutionStep[];
       status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
       currentStep: number;
       results: ExecutionStepResult[];
     }
     
     export interface ExecutionStep {
       toolId: string;
       inputs: Record<string, any>;
       dependsOn?: string[]; // Step IDs this step depends on
       condition?: string; // Conditional execution logic
     }
     
     export class ExecutionWorkflowService {
       private workflows: Map<string, ExecutionWorkflow> = new Map();
       private executionQueue: ExecutionQueueItem[] = [];
       private isProcessing = false;
       
       async createWorkflow(
         name: string,
         steps: ExecutionStep[]
       ): Promise<ExecutionWorkflow> {
         const workflow: ExecutionWorkflow = {
           id: `workflow_${Date.now()}`,
           name,
           tools: steps,
           status: 'idle',
           currentStep: 0,
           results: [],
         };
         
         this.workflows.set(workflow.id, workflow);
         return workflow;
       }
       
       async executeWorkflow(workflowId: string): Promise<void> {
         const workflow = this.workflows.get(workflowId);
         if (!workflow) throw new Error('Workflow not found');
         
         workflow.status = 'running';
         
         try {
           for (let i = 0; i < workflow.tools.length; i++) {
             workflow.currentStep = i;
             const step = workflow.tools[i];
             
             // Check dependencies
             if (step.dependsOn) {
               const dependenciesMet = this.checkDependencies(step.dependsOn, workflow.results);
               if (!dependenciesMet) {
                 throw new Error(`Dependencies not met for step ${i}`);
               }
             }
             
             // Execute step
             const result = await this.executeStep(step, workflow.results);
             workflow.results.push({
               stepIndex: i,
               toolId: step.toolId,
               ...result,
             });
           }
           
           workflow.status = 'completed';
         } catch (error) {
           workflow.status = 'failed';
           throw error;
         }
       }
       
       async executeStep(
         step: ExecutionStep,
         previousResults: ExecutionStepResult[]
       ): Promise<ExecutionResults> {
         // Resolve dynamic inputs from previous results
         const resolvedInputs = this.resolveInputs(step.inputs, previousResults);
         
         const response = await toolExecutionService.executeTool(
           step.toolId,
           resolvedInputs
         );
         
         // Poll for completion
         let status = await toolExecutionService.getExecutionStatus(response.executionId);
         while (status.status === 'running') {
           await new Promise(resolve => setTimeout(resolve, 1000));
           status = await toolExecutionService.getExecutionStatus(response.executionId);
         }
         
         if (status.status === 'failed') {
           throw new Error(status.error.message);
         }
         
         return status.results;
       }
       
       private resolveInputs(
         inputs: Record<string, any>,
         previousResults: ExecutionStepResult[]
       ): Record<string, any> {
         const resolved = { ...inputs };
         
         for (const [key, value] of Object.entries(resolved)) {
           if (typeof value === 'string' && value.startsWith('${')) {
             // Dynamic input resolution
             const reference = value.slice(2, -1); // Remove ${ }
             resolved[key] = this.resolveReference(reference, previousResults);
           }
         }
         
         return resolved;
       }
     }
     ```

3. **Integrate Output Rendering with Execution:**
   - Real-time output streaming and updates:
     ```typescript
     // src/components/tools/StreamingOutputRenderer.tsx
     export function StreamingOutputRenderer({
       executionId,
       onComplete,
       onError,
     }: StreamingOutputRendererProps) {
       const [currentData, setCurrentData] = useState<any>(null);
       const [isStreaming, setIsStreaming] = useState(false);
       const [progress, setProgress] = useState(0);
       
       useEffect(() => {
         if (executionId) {
           startStreaming();
         }
       }, [executionId]);
       
       const startStreaming = async () => {
         setIsStreaming(true);
         
         try {
           // Server-sent events for real-time updates
           const eventSource = new EventSource(`/api/executions/${executionId}/stream`);
           
           eventSource.onmessage = (event) => {
             const data = JSON.parse(event.data);
             
             switch (data.type) {
               case 'progress':
                 setProgress(data.progress);
                 break;
               
               case 'partial_result':
                 setCurrentData(prev => mergePartialData(prev, data.data));
                 break;
               
               case 'complete':
                 setCurrentData(data.data);
                 setIsStreaming(false);
                 onComplete?.(data.data);
                 eventSource.close();
                 break;
               
               case 'error':
                 setIsStreaming(false);
                 onError?.(data.error);
                 eventSource.close();
                 break;
             }
           };
           
           eventSource.onerror = () => {
             setIsStreaming(false);
             onError?.(new Error('Stream connection failed'));
             eventSource.close();
           };
         } catch (error) {
           setIsStreaming(false);
           onError?.(error as Error);
         }
       };
       
       return (
         <Box>
           {isStreaming && (
             <Box sx={{ mb: 2 }}>
               <Typography variant="body2" color="text.secondary">
                 Streaming results... {Math.round(progress)}%
               </Typography>
               <LinearProgress value={progress} variant="determinate" />
             </Box>
           )}
           
           {currentData && (
             <OutputRenderer
               data={currentData}
               title="Live Results"
               interactive={!isStreaming}
             />
           )}
         </Box>
       );
     }
     ```

4. **Add Execution Analytics and Feedback:**
   - Comprehensive execution tracking and user feedback:
     ```typescript
     // src/services/executionAnalyticsService.ts
     export class ExecutionAnalyticsService {
       private metrics: Map<string, ExecutionMetrics[]> = new Map();
       
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
           duration: execution.endTime 
             ? execution.endTime.getTime() - execution.startTime.getTime()
             : null,
           status: execution.status,
           inputSize: this.calculateInputSize(inputs),
           outputSize: execution.results ? this.calculateOutputSize(execution.results) : null,
           errorType: execution.error?.code,
           userId: this.getCurrentUserId(),
           timestamp: new Date(),
         };
         
         const toolMetrics = this.metrics.get(toolId) || [];
         toolMetrics.push(metric);
         this.metrics.set(toolId, toolMetrics);
         
         // Send to analytics backend
         this.sendToAnalytics(metric);
       }
       
       getToolMetrics(toolId: string): ToolAnalytics {
         const metrics = this.metrics.get(toolId) || [];
         
         return {
           totalExecutions: metrics.length,
           successRate: this.calculateSuccessRate(metrics),
           averageDuration: this.calculateAverageDuration(metrics),
           popularInputs: this.identifyPopularInputs(metrics),
           errorPatterns: this.analyzeErrorPatterns(metrics),
           usageOverTime: this.generateUsageTimeline(metrics),
         };
       }
       
       generateExecutionReport(executionId: string): ExecutionReport {
         // Implementation for detailed execution reports
         return {
           executionId,
           summary: this.generateSummary(executionId),
           performance: this.analyzePerformance(executionId),
           recommendations: this.generateRecommendations(executionId),
         };
       }
     }
     
     // src/components/tools/ExecutionFeedback.tsx
     export function ExecutionFeedback({
       execution,
       onFeedbackSubmit,
     }: ExecutionFeedbackProps) {
       const [rating, setRating] = useState<number | null>(null);
       const [feedback, setFeedback] = useState('');
       const [reportIssue, setReportIssue] = useState(false);
       
       const handleSubmit = () => {
         onFeedbackSubmit({
           executionId: execution.id,
           rating,
           feedback,
           reportIssue,
           timestamp: new Date(),
         });
       };
       
       return (
         <Card>
           <CardHeader title="Execution Feedback" />
           <CardContent>
             <Box sx={{ mb: 2 }}>
               <Typography variant="body2" gutterBottom>
                 How would you rate this execution?
               </Typography>
               <Rating
                 value={rating}
                 onChange={(_, value) => setRating(value)}
                 size="large"
               />
             </Box>
             
             <TextField
               multiline
               rows={3}
               placeholder="Additional feedback (optional)"
               value={feedback}
               onChange={(e) => setFeedback(e.target.value)}
               fullWidth
               sx={{ mb: 2 }}
             />
             
             <FormControlLabel
               control={
                 <Checkbox
                   checked={reportIssue}
                   onChange={(e) => setReportIssue(e.target.checked)}
                 />
               }
               label="Report an issue with this execution"
             />
             
             <Box sx={{ mt: 2 }}>
               <Button
                 variant="contained"
                 onClick={handleSubmit}
                 disabled={rating === null}
               >
                 Submit Feedback
               </Button>
             </Box>
           </CardContent>
         </Card>
       );
     }
     ```

## 3. Advanced Execution Features

**Execution Templates and Saved Configurations:**
```typescript
// src/components/tools/ExecutionTemplates.tsx
export function ExecutionTemplates({ tool }: ExecutionTemplatesProps) {
  const [templates, setTemplates] = useState<ExecutionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const saveTemplate = (name: string, inputs: Record<string, any>) => {
    const template: ExecutionTemplate = {
      id: `template_${Date.now()}`,
      name,
      toolId: tool.id,
      inputs,
      createdAt: new Date(),
    };
    
    setTemplates(prev => [...prev, template]);
    
    // Persist to local storage
    const saved = JSON.parse(localStorage.getItem('execution-templates') || '[]');
    saved.push(template);
    localStorage.setItem('execution-templates', JSON.stringify(saved));
  };
  
  return (
    <Card>
      <CardHeader title="Execution Templates" />
      <CardContent>
        <Grid container spacing={2}>
          {templates.map(template => (
            <Grid item xs={12} sm={6} key={template.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{template.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      Load Template
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
```

**Execution Comparison and Analysis:**
```typescript
// src/components/tools/ExecutionComparison.tsx
export function ExecutionComparison({
  executions,
}: ExecutionComparisonProps) {
  const [selectedExecutions, setSelectedExecutions] = useState<string[]>([]);
  
  const compareExecutions = () => {
    const comparison = {
      performance: comparePerformance(selectedExecutions),
      outputs: compareOutputs(selectedExecutions),
      inputs: compareInputs(selectedExecutions),
    };
    
    return comparison;
  };
  
  return (
    <Card>
      <CardHeader title="Execution Comparison" />
      <CardContent>
        <DataGrid
          rows={executions}
          columns={comparisonColumns}
          checkboxSelection
          onRowSelectionModelChange={setSelectedExecutions}
        />
        
        {selectedExecutions.length >= 2 && (
          <ComparisonResults 
            comparison={compareExecutions()}
          />
        )}
      </CardContent>
    </Card>
  );
}
```

## 4. Error Handling and Recovery

**Advanced Error Handling:**
```typescript
// src/components/tools/ExecutionErrorHandler.tsx
export function ExecutionErrorHandler({
  error,
  onRetry,
  onReport,
}: ExecutionErrorHandlerProps) {
  const getSuggestedActions = (error: ExecutionError) => {
    switch (error.code) {
      case 'INVALID_INPUT':
        return [
          'Check input validation requirements',
          'Review input format and types',
          'Try with sample data',
        ];
      
      case 'RESOURCE_EXHAUSTED':
        return [
          'Reduce input data size',
          'Split processing into smaller chunks',
          'Try again during off-peak hours',
        ];
      
      case 'TIMEOUT':
        return [
          'Reduce processing complexity',
          'Increase timeout settings',
          'Break into smaller operations',
        ];
      
      default:
        return ['Contact support for assistance'];
    }
  };
  
  return (
    <Alert severity="error">
      <AlertTitle>Execution Failed</AlertTitle>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {error.message}
      </Typography>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Suggested Actions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {getSuggestedActions(error).map((action, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <SuggestIcon />
                </ListItemIcon>
                <ListItemText primary={action} />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
      
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        {error.retryable && (
          <Button onClick={onRetry} variant="contained" size="small">
            Retry Execution
          </Button>
        )}
        <Button onClick={onReport} variant="outlined" size="small">
          Report Issue
        </Button>
      </Box>
    </Alert>
  );
}
```

## 5. Expected Output & Deliverables

**Success Criteria:**
- Functional ExecutionPanel connected to mock backend
- Real-time execution progress and status updates
- Comprehensive error handling with recovery suggestions
- Execution workflow management and queuing
- Output streaming and incremental updates
- Execution analytics and user feedback collection
- Template system for saved configurations
- Execution comparison and analysis tools

**Deliverables:**
1. **Enhanced Execution Components:**
   - `src/components/tools/EnhancedExecutionPanel.tsx`
   - `src/components/tools/ExecutionProgress.tsx`
   - `src/components/tools/StreamingOutputRenderer.tsx`
   - `src/components/tools/ExecutionErrorHandler.tsx`

2. **Workflow Management:**
   - `src/services/executionWorkflowService.ts`
   - `src/components/tools/ExecutionTemplates.tsx`
   - `src/components/tools/ExecutionComparison.tsx`

3. **Analytics and Feedback:**
   - `src/services/executionAnalyticsService.ts`
   - `src/components/tools/ExecutionFeedback.tsx`
   - `src/components/tools/ExecutionMetrics.tsx`

4. **Service Integration:**
   - `src/hooks/useToolExecution.ts`
   - Enhanced `src/services/toolExecutionService.ts`
   - Real-time streaming support

## 6. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_4_Full_UI_Mock_Execution/Task_4.4_Tool_Execution_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_Frontend_Dev)
- Task reference (Phase 4 / Task 4.4)
- Execution workflow architecture
- Real-time streaming implementation
- Error handling and recovery mechanisms
- Analytics and feedback systems
- Template and comparison features
- Integration with output rendering

Please acknowledge receipt and proceed with implementation.