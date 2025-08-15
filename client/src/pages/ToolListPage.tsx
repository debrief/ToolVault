import { useEffect } from 'react';
import { ToolList } from '../components/tools/ToolList';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import type { Tool } from '../types/index';

export function ToolListPage() {
  const navigate = useNavigate();

  // Set document title
  useEffect(() => {
    document.title = 'Tool Catalog - ToolVault';
  }, []);

  const handleViewDetails = (tool: Tool) => {
    navigate(`/tools/${tool.id}`);
  };

  return (
    <MainLayout>
      <ToolList onViewDetails={handleViewDetails} />
    </MainLayout>
  );
}