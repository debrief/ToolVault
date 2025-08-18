This folder contains definitions of the UI components of ToolVault, with thoughts, constraints, decisions.

## UI Architecture Overview

Based on user journey: Homepage → Browse Tools → Tool Detail → Execution

### Navigation Pattern
- Traditional top navigation bar with breadcrumbs
- Back/forward navigation between pages

### Error Handling Strategy
- Toast notifications for system messages
- Inline validation errors within forms
- Error banners for page-level issues
- Modal dialogs for confirmations

## Component Hierarchy

### 1. Application Shell
- **AppHeader**: Top navigation with breadcrumbs, search, branding
- **AppLayout**: Main container managing page transitions
- **ErrorBoundary**: Global error catching and display

### 2. Homepage Components
- **HomePage**: Container for landing page
- **SearchHero**: Prominent search bar with category overview
- **CategoryPreview**: Visual grid of available categories

### 3. Browse/Discovery Components
- **BrowsePage**: Main container for tool discovery
- **ToolGrid**: List/grid display of tools
- **ToolCard**: Individual tool preview with metadata
- **FilterSidebar**: Categories, search, and tags filtering
- **SearchBox**: Integrated search functionality (ideally including fuzzy search, for imprecise matches)
- **CategoryFilter**: Hierarchical category selection
- **TagFilter**: Multi-select tag filtering

### 4. Tool Detail Components
- **ToolDetailPage**: Container for individual tool view
- **ToolTabs**: Tab interface (Overview, Example, History)
- **ToolOverview**: Description, metadata, inputs/outputs
- **ToolExample**: Input/Output components, plus trigger button.
- **ToolHistory**: Execution history display (placeholder initially)
- **InputOutputVisualization**: Shows data types and formats
- **ExecutionInterface**: Run button positioned between input/output visualizations

### 5. Input/Output Components
- **InputSection**: Container for tool input configuration (subject element, plus params)
- **OutputSection**: Container for tool output display
- **DataTypeDisplay**: Shows format information (GeoJSON, CSV, Number, etc.)
- **CustomViewers**: Custom viewers for different input/output data types, selected from drop-down (GeoJSON, CSV, Number, etc.)
- **InputForm**: Dynamic form generation based on tool metadata
- **ParameterInput**: Individual parameter input components
- **ValidationMessage**: Inline error display for form fields

### 6. Execution Components
- **RunButton**: Central execution trigger
- **ExecutionStatus**: Progress indicator and status display
- **ResultDisplay**: Container for tool execution results
- **HistoryEntry**: Individual execution record

### 7. Utility Components
- **LoadingSpinner**: Loading states
- **ErrorMessage**: Reusable error display
- **ToastNotification**: System messages and alerts
- **Modal**: Reusable modal/dialog container
- **Breadcrumbs**: Navigation path display
- **Badge**: Category/tag display elements

### 8. Layout Components
- **PageContainer**: Consistent page wrapper
- **SidebarLayout**: Two-column layout for browse page
- **ContentArea**: Main content container
- **ResponsiveGrid**: Adaptive grid system for tool cards

## Responsive Design Notes
- Horizontal layout for input/output visualization (ideal)
- Vertical layout as fallback for smaller screens
- Sidebar filters may collapse to dropdown on mobile
- Tool grid adapts from multi-column to single column
