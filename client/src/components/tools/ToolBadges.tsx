import React from 'react';
import {
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  NewReleases as NewReleasesIcon,
  Update as UpdateIcon,
  TrendingUp as TrendingUpIcon,
  BugReport as BugReportIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  Engineering as EngineeringIcon,
} from '@mui/icons-material';
import type { Tool } from '../../types/index';
import type { ToolMetadata } from '../../utils/searchUtils';

export interface BadgeConfig {
  type: 'new' | 'updated' | 'popular' | 'beta' | 'stable' | 'deprecated' | 'beginner' | 'intermediate' | 'advanced';
  label: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default';
  icon?: React.ReactNode;
  tooltip?: string;
  condition: (tool: Tool, metadata?: ToolMetadata) => boolean;
  priority: number; // Higher priority badges show first
}

const badgeConfigs: BadgeConfig[] = [
  {
    type: 'new',
    label: 'New',
    color: 'primary',
    icon: <NewReleasesIcon />,
    tooltip: 'Recently added tool',
    priority: 10,
    condition: (tool, metadata) => {
      if (!metadata?.created) return false;
      const createdDate = new Date(metadata.created);
      const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation <= 7;
    }
  },
  {
    type: 'updated',
    label: 'Updated',
    color: 'info',
    icon: <UpdateIcon />,
    tooltip: 'Recently updated',
    priority: 9,
    condition: (tool, metadata) => {
      if (!metadata?.updated) return false;
      const updatedDate = new Date(metadata.updated);
      const daysSinceUpdate = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Show "updated" badge if updated within last 30 days but not if it's "new"
      if (daysSinceUpdate <= 30) {
        // Don't show if it's also new
        if (metadata.created) {
          const createdDate = new Date(metadata.created);
          const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceCreation > 7;
        }
        return true;
      }
      return false;
    }
  },
  {
    type: 'popular',
    label: 'Popular',
    color: 'success',
    icon: <TrendingUpIcon />,
    tooltip: 'Frequently used tool',
    priority: 8,
    condition: (tool, metadata) => {
      if (!metadata?.usage?.executions) return false;
      return metadata.usage.executions > 1000;
    }
  },
  {
    type: 'beta',
    label: 'Beta',
    color: 'warning',
    icon: <BugReportIcon />,
    tooltip: 'Beta version - may have issues',
    priority: 7,
    condition: (tool, metadata) => metadata?.status === 'beta'
  },
  {
    type: 'stable',
    label: 'Stable',
    color: 'success',
    icon: <VerifiedIcon />,
    tooltip: 'Production ready',
    priority: 6,
    condition: (tool, metadata) => metadata?.status === 'stable'
  },
  {
    type: 'deprecated',
    label: 'Deprecated',
    color: 'error',
    icon: <WarningIcon />,
    tooltip: 'This tool is deprecated',
    priority: 11, // Highest priority to show prominently
    condition: (tool, metadata) => metadata?.status === 'deprecated'
  },
  {
    type: 'beginner',
    label: 'Beginner',
    color: 'success',
    icon: <SchoolIcon />,
    tooltip: 'Suitable for beginners',
    priority: 3,
    condition: (tool, metadata) => metadata?.complexity === 'beginner'
  },
  {
    type: 'intermediate',
    label: 'Intermediate',
    color: 'warning',
    icon: <PsychologyIcon />,
    tooltip: 'Requires some experience',
    priority: 2,
    condition: (tool, metadata) => metadata?.complexity === 'intermediate'
  },
  {
    type: 'advanced',
    label: 'Advanced',
    color: 'error',
    icon: <EngineeringIcon />,
    tooltip: 'For experienced users',
    priority: 1,
    condition: (tool, metadata) => metadata?.complexity === 'advanced'
  }
];

export interface ToolBadgesProps {
  tool: Tool;
  metadata?: ToolMetadata;
  maxBadges?: number;
  size?: 'small' | 'medium';
  showTooltips?: boolean;
  variant?: 'filled' | 'outlined';
}

export const ToolBadges: React.FC<ToolBadgesProps> = ({
  tool,
  metadata,
  maxBadges = 3,
  size = 'small',
  showTooltips = true,
  variant = 'filled',
}) => {
  const applicableBadges = badgeConfigs
    .filter(config => config.condition(tool, metadata))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxBadges);

  if (applicableBadges.length === 0) return null;

  const renderBadge = (badge: BadgeConfig, index: number) => {
    const chip = (
      <Chip
        key={badge.type}
        label={badge.label}
        color={badge.color}
        size={size}
        icon={badge.icon}
        variant={variant}
        sx={{
          '& .MuiChip-icon': {
            fontSize: size === 'small' ? '0.75rem' : '1rem'
          }
        }}
      />
    );

    if (showTooltips && badge.tooltip) {
      return (
        <Tooltip key={badge.type} title={badge.tooltip} arrow>
          {chip}
        </Tooltip>
      );
    }

    return chip;
  };

  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
      {applicableBadges.map(renderBadge)}
    </Box>
  );
};

/**
 * Utility function to get badge configs for a tool
 */
export function getToolBadges(tool: Tool, metadata?: ToolMetadata): BadgeConfig[] {
  return badgeConfigs.filter(config => config.condition(tool, metadata));
}

/**
 * Check if a tool has a specific badge type
 */
export function hasBadge(tool: Tool, metadata: ToolMetadata | undefined, badgeType: BadgeConfig['type']): boolean {
  const config = badgeConfigs.find(c => c.type === badgeType);
  return config ? config.condition(tool, metadata) : false;
}

/**
 * Get badge count for filtering
 */
export function getBadgeCount(tool: Tool, metadata?: ToolMetadata): number {
  return badgeConfigs.filter(config => config.condition(tool, metadata)).length;
}

export default ToolBadges;