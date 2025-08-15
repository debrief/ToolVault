import { useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ToolDetail } from '../components/tools/ToolDetail';
import { useToolById } from '../hooks/useToolById';

export function ToolDetailPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { tool, isLoading, isError, isNotFound } = useToolById(toolId);

  // Set document title when tool loads
  useEffect(() => {
    if (tool) {
      document.title = `${tool.name} - ToolVault`;
    }
  }, [tool]);

  // Handle navigation callbacks
  const handleBackToTools = () => {
    navigate('/tools');
  };

  // Show loading or error states
  if (isLoading) {
    return (
      <ToolDetail
        toolId={toolId || ''}
        onBack={handleBackToTools}
      />
    );
  }

  // Redirect to 404 if tool not found
  if (isNotFound || isError || !toolId) {
    return <Navigate to="/404" replace />;
  }

  return (
    <ToolDetail
      toolId={toolId}
      onBack={handleBackToTools}
    />
  );
}