import type { ViewMode, SortMode } from './ToolBrowser';
import './ViewControls.css';

interface ViewControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
}

function ViewControls({
  viewMode,
  onViewModeChange,
  sortMode,
  onSortModeChange,
}: ViewControlsProps) {
  return (
    <div className="view-controls">
      <div className="view-mode-toggle">
        <button
          className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => onViewModeChange('grid')}
          title="Grid view"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="1" y="1" width="6" height="6" fill="currentColor"/>
            <rect x="9" y="1" width="6" height="6" fill="currentColor"/>
            <rect x="1" y="9" width="6" height="6" fill="currentColor"/>
            <rect x="9" y="9" width="6" height="6" fill="currentColor"/>
          </svg>
        </button>
        <button
          className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => onViewModeChange('list')}
          title="List view"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="1" y="2" width="14" height="2" fill="currentColor"/>
            <rect x="1" y="7" width="14" height="2" fill="currentColor"/>
            <rect x="1" y="12" width="14" height="2" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div className="sort-control">
        <label htmlFor="sort-select">Sort by:</label>
        <select
          id="sort-select"
          value={sortMode}
          onChange={(e) => onSortModeChange(e.target.value as SortMode)}
          className="sort-select"
        >
          <option value="name">Name</option>
          <option value="category">Category</option>
          <option value="complexity">Complexity</option>
        </select>
      </div>
    </div>
  );
}

export default ViewControls;