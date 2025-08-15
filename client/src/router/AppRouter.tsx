import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load all pages for optimal code splitting
const HomePage = lazy(() => import('../pages/HomePage').then(module => ({ default: module.HomePage })));
const ToolListPage = lazy(() => import('../pages/ToolListPage').then(module => ({ default: module.ToolListPage })));
const ToolDetailPage = lazy(() => import('../pages/ToolDetailPage').then(module => ({ default: module.ToolDetailPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

export function AppRouter() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tools" element={<ToolListPage />} />
        <Route path="/tools/:toolId" element={<ToolDetailPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}