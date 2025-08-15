import type { Tool } from '../types/index';
import type { ToolMetadata } from './searchUtils';
import type { BadgeConfig } from '../components/tools/ToolBadges';

/**
 * Badge configuration and logic utilities
 */

export interface BadgeStatistics {
  total: number;
  new: number;
  updated: number;
  popular: number;
  beta: number;
  stable: number;
  deprecated: number;
  beginner: number;
  intermediate: number;
  advanced: number;
}

/**
 * Calculate badge statistics for a collection of tools
 */
export function calculateBadgeStatistics(
  tools: Tool[], 
  metadata: Map<string, ToolMetadata>
): BadgeStatistics {
  const stats: BadgeStatistics = {
    total: tools.length,
    new: 0,
    updated: 0,
    popular: 0,
    beta: 0,
    stable: 0,
    deprecated: 0,
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  };

  tools.forEach(tool => {
    const toolMetadata = metadata.get(tool.id);
    
    // Check for new tools (created within last 7 days)
    if (toolMetadata?.created) {
      const createdDate = new Date(toolMetadata.created);
      const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation <= 7) {
        stats.new++;
      }
    }

    // Check for updated tools (updated within last 30 days, but not new)
    if (toolMetadata?.updated) {
      const updatedDate = new Date(toolMetadata.updated);
      const daysSinceUpdate = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate <= 30) {
        // Don't count as updated if it's also new
        if (toolMetadata.created) {
          const createdDate = new Date(toolMetadata.created);
          const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceCreation > 7) {
            stats.updated++;
          }
        } else {
          stats.updated++;
        }
      }
    }

    // Check for popular tools
    if (toolMetadata?.usage?.executions && toolMetadata.usage.executions > 1000) {
      stats.popular++;
    }

    // Check status
    switch (toolMetadata?.status) {
      case 'beta':
        stats.beta++;
        break;
      case 'stable':
        stats.stable++;
        break;
      case 'deprecated':
        stats.deprecated++;
        break;
    }

    // Check complexity
    switch (toolMetadata?.complexity) {
      case 'beginner':
        stats.beginner++;
        break;
      case 'intermediate':
        stats.intermediate++;
        break;
      case 'advanced':
        stats.advanced++;
        break;
    }
  });

  return stats;
}

/**
 * Filter tools by badge type
 */
export function filterToolsByBadge(
  tools: Tool[],
  metadata: Map<string, ToolMetadata>,
  badgeType: keyof Omit<BadgeStatistics, 'total'>
): Tool[] {
  return tools.filter(tool => {
    const toolMetadata = metadata.get(tool.id);
    
    switch (badgeType) {
      case 'new':
        if (!toolMetadata?.created) return false;
        const createdDate = new Date(toolMetadata.created);
        const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCreation <= 7;

      case 'updated':
        if (!toolMetadata?.updated) return false;
        const updatedDate = new Date(toolMetadata.updated);
        const daysSinceUpdate = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate <= 30) {
          // Don't show if it's also new
          if (toolMetadata.created) {
            const createdDate = new Date(toolMetadata.created);
            const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceCreation > 7;
          }
          return true;
        }
        return false;

      case 'popular':
        return !!(toolMetadata?.usage?.executions && toolMetadata.usage.executions > 1000);

      case 'beta':
        return toolMetadata?.status === 'beta';

      case 'stable':
        return toolMetadata?.status === 'stable';

      case 'deprecated':
        return toolMetadata?.status === 'deprecated';

      case 'beginner':
        return toolMetadata?.complexity === 'beginner';

      case 'intermediate':
        return toolMetadata?.complexity === 'intermediate';

      case 'advanced':
        return toolMetadata?.complexity === 'advanced';

      default:
        return false;
    }
  });
}

/**
 * Get badge color theme for consistency
 */
export function getBadgeColor(badgeType: string): {
  main: string;
  background: string;
  text: string;
} {
  const colors = {
    new: { main: '#1976d2', background: '#e3f2fd', text: '#0d47a1' },
    updated: { main: '#0288d1', background: '#e1f5fe', text: '#01579b' },
    popular: { main: '#2e7d32', background: '#e8f5e8', text: '#1b5e20' },
    beta: { main: '#ed6c02', background: '#fff3e0', text: '#e65100' },
    stable: { main: '#2e7d32', background: '#e8f5e8', text: '#1b5e20' },
    deprecated: { main: '#d32f2f', background: '#ffebee', text: '#c62828' },
    beginner: { main: '#2e7d32', background: '#e8f5e8', text: '#1b5e20' },
    intermediate: { main: '#ed6c02', background: '#fff3e0', text: '#e65100' },
    advanced: { main: '#d32f2f', background: '#ffebee', text: '#c62828' },
  };

  return colors[badgeType as keyof typeof colors] || colors.stable;
}

/**
 * Generate badge descriptions for accessibility
 */
export function getBadgeDescription(badgeType: string, metadata?: ToolMetadata): string {
  switch (badgeType) {
    case 'new':
      return 'This tool was recently added to the collection';
    case 'updated':
      return 'This tool was recently updated with new features or improvements';
    case 'popular':
      const executions = metadata?.usage?.executions || 0;
      return `This tool is popular with ${executions.toLocaleString()} executions`;
    case 'beta':
      return 'This tool is in beta testing and may have issues';
    case 'stable':
      return 'This tool is stable and production-ready';
    case 'deprecated':
      return 'This tool is deprecated and may be removed in the future';
    case 'beginner':
      return 'This tool is suitable for users with beginner-level experience';
    case 'intermediate':
      return 'This tool requires intermediate-level experience';
    case 'advanced':
      return 'This tool is designed for users with advanced expertise';
    default:
      return 'Badge information';
  }
}

/**
 * Sort badges by priority
 */
export function sortBadgesByPriority(badges: string[]): string[] {
  const priorityOrder = [
    'deprecated', // Highest priority
    'new',
    'updated',
    'popular',
    'beta',
    'stable',
    'beginner',
    'intermediate',
    'advanced', // Lowest priority
  ];

  return badges.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a);
    const bIndex = priorityOrder.indexOf(b);
    
    // If badge not found in priority list, put it at the end
    const aPriority = aIndex === -1 ? priorityOrder.length : aIndex;
    const bPriority = bIndex === -1 ? priorityOrder.length : bIndex;
    
    return aPriority - bPriority;
  });
}

/**
 * Get recommended badge combinations
 */
export function getRecommendedBadges(tool: Tool, metadata?: ToolMetadata): string[] {
  const badges: string[] = [];
  
  // Always show status-related badges first
  if (metadata?.status === 'deprecated') {
    badges.push('deprecated');
    return badges; // If deprecated, show only that
  }
  
  if (metadata?.status === 'beta') {
    badges.push('beta');
  }
  
  if (metadata?.status === 'stable') {
    badges.push('stable');
  }
  
  // Show temporal badges
  if (metadata?.created) {
    const createdDate = new Date(metadata.created);
    const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 7) {
      badges.push('new');
    }
  }
  
  if (metadata?.updated) {
    const updatedDate = new Date(metadata.updated);
    const daysSinceUpdate = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate <= 30) {
      // Don't show updated if it's also new
      if (!badges.includes('new')) {
        badges.push('updated');
      }
    }
  }
  
  // Show popularity
  if (metadata?.usage?.executions && metadata.usage.executions > 1000) {
    badges.push('popular');
  }
  
  // Show complexity (only if not too many badges already)
  if (badges.length < 3 && metadata?.complexity) {
    badges.push(metadata.complexity);
  }
  
  return sortBadgesByPriority(badges).slice(0, 3); // Max 3 badges
}