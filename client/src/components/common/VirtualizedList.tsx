import { CSSProperties, forwardRef, useMemo, useCallback } from 'react';
import { FixedSizeList as List, VariableSizeList, ListChildComponentProps } from 'react-window';
import { Box, useTheme } from '@mui/material';
import type { Tool } from '../../types/index';

interface VirtualizedListProps {
  items: Tool[];
  itemHeight: number | ((index: number) => number);
  height: number;
  width?: string | number;
  renderItem: (props: VirtualizedListItemProps) => React.ReactElement;
  onItemClick?: (item: Tool, index: number) => void;
  className?: string;
  style?: CSSProperties;
  overscanCount?: number;
  threshold?: number;
}

interface VirtualizedListItemProps {
  item: Tool;
  index: number;
  style: CSSProperties;
  onClick?: () => void;
}

interface ItemData {
  items: Tool[];
  renderItem: (props: VirtualizedListItemProps) => React.ReactElement;
  onItemClick?: (item: Tool, index: number) => void;
}

// Row component for react-window
const Row = ({ index, style, data }: ListChildComponentProps<ItemData>) => {
  const { items, renderItem, onItemClick } = data;
  const item = items[index];
  
  const handleClick = useCallback(() => {
    onItemClick?.(item, index);
  }, [item, index, onItemClick]);

  return renderItem({
    item,
    index,
    style,
    onClick: handleClick,
  });
};

// Variable size row component
const VariableRow = ({ index, style, data }: ListChildComponentProps<ItemData>) => {
  const { items, renderItem, onItemClick } = data;
  const item = items[index];
  
  const handleClick = useCallback(() => {
    onItemClick?.(item, index);
  }, [item, index, onItemClick]);

  return renderItem({
    item,
    index,
    style,
    onClick: handleClick,
  });
};

export function VirtualizedList({
  items,
  itemHeight,
  height,
  width = '100%',
  renderItem,
  onItemClick,
  className,
  style,
  overscanCount = 5,
  threshold = 100,
}: VirtualizedListProps) {
  const theme = useTheme();
  
  const itemData: ItemData = useMemo(() => ({
    items,
    renderItem,
    onItemClick,
  }), [items, renderItem, onItemClick]);

  const containerStyle: CSSProperties = {
    width,
    height,
    ...style,
  };

  // Use VariableSizeList if itemHeight is a function, otherwise use FixedSizeList
  const isVariableSize = typeof itemHeight === 'function';

  // Only enable virtualization if we have enough items
  if (items.length < threshold) {
    return (
      <Box
        className={className}
        sx={{
          width,
          height,
          overflow: 'auto',
          ...style,
        }}
      >
        {items.map((item, index) => {
          const calculatedHeight = typeof itemHeight === 'function' 
            ? itemHeight(index) 
            : itemHeight;
            
          return renderItem({
            key: `item-${index}`,
            item,
            index,
            style: {
              height: calculatedHeight,
              width: '100%',
            },
            onClick: onItemClick ? () => onItemClick(item, index) : undefined,
          });
        })}
      </Box>
    );
  }

  return (
    <Box className={className} sx={containerStyle}>
      {isVariableSize ? (
        <VariableSizeList
          height={height}
          itemCount={items.length}
          itemSize={itemHeight as (index: number) => number}
          itemData={itemData}
          width={width}
          overscanCount={overscanCount}
        >
          {VariableRow}
        </VariableSizeList>
      ) : (
        <List
          height={height}
          itemCount={items.length}
          itemSize={itemHeight as number}
          itemData={itemData}
          width={width}
          overscanCount={overscanCount}
        >
          {Row}
        </List>
      )}
    </Box>
  );
}

// Higher-order component for easy tool list virtualization
interface VirtualizedToolListProps {
  tools: Tool[];
  renderToolCard: (props: VirtualizedListItemProps) => React.ReactElement;
  onToolClick?: (tool: Tool) => void;
  cardHeight?: number;
  listHeight?: number;
  className?: string;
  style?: CSSProperties;
}

export function VirtualizedToolList({
  tools,
  renderToolCard,
  onToolClick,
  cardHeight = 200,
  listHeight = 600,
  className,
  style,
}: VirtualizedToolListProps) {
  const handleItemClick = useCallback((tool: Tool, index: number) => {
    onToolClick?.(tool);
  }, [onToolClick]);

  return (
    <VirtualizedList
      items={tools}
      itemHeight={cardHeight}
      height={listHeight}
      renderItem={renderToolCard}
      onItemClick={handleItemClick}
      className={className}
      style={style}
      threshold={50} // Start virtualizing with 50+ items
    />
  );
}

// Pre-built virtualized tool card component
export const VirtualizedToolCard = forwardRef<
  HTMLDivElement,
  VirtualizedListItemProps & { 
    elevation?: number;
    compact?: boolean;
  }
>(({ item, style, onClick, elevation = 1, compact = false }, ref) => {
  const theme = useTheme();
  
  return (
    <Box
      ref={ref}
      onClick={onClick}
      sx={{
        ...style,
        p: compact ? 1 : 2,
        m: 1,
        cursor: 'pointer',
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: theme.shadows[elevation],
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[elevation + 2],
        },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ fontWeight: 600, fontSize: compact ? '0.875rem' : '1rem', mb: 1 }}>
        {item.name}
      </Box>
      <Box sx={{ 
        fontSize: compact ? '0.75rem' : '0.875rem', 
        color: 'text.secondary',
        mb: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: compact ? 2 : 3,
        WebkitBoxOrient: 'vertical',
      }}>
        {item.description}
      </Box>
      <Box sx={{ 
        fontSize: '0.75rem', 
        color: 'primary.main',
        fontWeight: 500,
        mt: 'auto'
      }}>
        {item.category}
      </Box>
    </Box>
  );
});

VirtualizedToolCard.displayName = 'VirtualizedToolCard';