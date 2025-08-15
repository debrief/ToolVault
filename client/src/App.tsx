import { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { ToolList } from './components/tools/ToolList';
import { ToolDetail } from './components/tools/ToolDetail';
import type { Tool } from './types/index';

type AppView = 'list' | 'detail';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('list');
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  const handleViewDetails = (tool: Tool) => {
    setSelectedToolId(tool.id);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedToolId(null);
  };

  return (
    <MainLayout>
      {currentView === 'list' && (
        <ToolList onViewDetails={handleViewDetails} />
      )}
      
      {currentView === 'detail' && selectedToolId && (
        <ToolDetail
          toolId={selectedToolId}
          onNavigateHome={handleBackToList}
          onNavigateToTools={handleBackToList}
          onBack={handleBackToList}
        />
      )}
    </MainLayout>
  );
}

export default App;