import { Container, Paper, Box, Skeleton, Alert, Typography, Stack, Divider } from '@mui/material';
import { useToolById } from '../../hooks/useToolById';
import { ToolBreadcrumbs } from './ToolBreadcrumbs';
import { ToolHeader } from './ToolHeader';
import { InputsList } from './InputsList';
import { OutputsList } from './OutputsList';
import { ExecutionPanel } from './ExecutionPanel';
import { DynamicExecutionPanel } from './DynamicExecutionPanel';

interface ToolDetailProps {
  toolId: string;
  onBack?: () => void;
}

function ToolDetailSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Skeleton variant="text" width={300} height={32} sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="60%" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="rectangular" width={80} height={32} />
          <Skeleton variant="rectangular" width={60} height={32} />
          <Skeleton variant="rectangular" width={70} height={32} />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ mb: 3 }}>
              <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={56} />
            </Box>
          ))}
        </Paper>
        
        <Paper sx={{ p: 3 }}>
          <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
          {[1, 2].map((i) => (
            <Box key={i} sx={{ mb: 3 }}>
              <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={100} />
            </Box>
          ))}
        </Paper>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width={200} height={48} sx={{ mx: 'auto', display: 'block' }} />
      </Paper>
    </Container>
  );
}

function ToolNotFound() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Alert severity="error" sx={{ mb: 3 }} data-testid="tool-not-found">
        <Typography variant="h6" gutterBottom>
          Tool Not Found
        </Typography>
        <Typography variant="body2">
          The requested tool could not be found. It may have been removed or the ID is incorrect.
        </Typography>
      </Alert>
    </Container>
  );
}

function ToolError({ error }: { error: Error }) {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Alert severity="error" sx={{ mb: 3 }} data-testid="tool-error">
        <Typography variant="h6" gutterBottom>
          Error Loading Tool
        </Typography>
        <Typography variant="body2">
          {error.message || 'An unexpected error occurred while loading the tool.'}
        </Typography>
      </Alert>
    </Container>
  );
}

export function ToolDetail({ 
  toolId, 
  onBack 
}: ToolDetailProps) {
  const { tool, isLoading, isError, error, isNotFound } = useToolById(toolId);


  if (isLoading) {
    return <ToolDetailSkeleton />;
  }

  if (isError && error) {
    return <ToolError error={error as Error} />;
  }

  if (isNotFound || !tool) {
    return <ToolNotFound />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }} data-testid="tool-detail">
      {/* Breadcrumbs */}
      <ToolBreadcrumbs
        toolName={tool.name}
      />

      {/* Tool Header */}
      <ToolHeader
        tool={tool}
        onBackClick={onBack}
      />

      {/* Main Content Layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        {/* Input Parameters */}
        <Paper elevation={2} data-testid="input-section">
          <InputsList
            inputs={tool.inputs}
            readOnly
          />
        </Paper>

        {/* Expected Outputs */}
        <Paper elevation={2} data-testid="output-section">
          <OutputsList
            outputs={tool.outputs}
          />
        </Paper>
      </Box>

      {/* Execution Panels */}
      <Stack spacing={3} id="execution-panel" data-testid="execution-panel">
        {/* Dynamic Execution (Real Tools) */}
        {tool.module && (
          <DynamicExecutionPanel tool={tool} />
        )}

        {/* Legacy/Mock Execution Panel */}
        {!tool.module && (
          <>
            <Divider />
            <ExecutionPanel tool={tool} />
          </>
        )}
        
      </Stack>
    </Container>
  );
}