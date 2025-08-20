import './CategoryFilter.css';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onClearAll: () => void;
}

function CategoryFilter({ 
  categories, 
  selectedCategories, 
  onCategoryToggle, 
  onClearAll 
}: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="category-filter">
      <div className="filter-header">
        <h4>Categories</h4>
        {selectedCategories.length > 0 && (
          <button 
            className="clear-btn"
            onClick={onClearAll}
            title="Clear category filters"
          >
            Clear
          </button>
        )}
      </div>
      
      <div className="category-chips">
        {categories.map(category => (
          <button
            key={category}
            className={`category-chip ${selectedCategories.includes(category) ? 'selected' : ''}`}
            onClick={() => onCategoryToggle(category)}
          >
            {category}
            {selectedCategories.includes(category) && (
              <span className="chip-close">×</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryFilter;