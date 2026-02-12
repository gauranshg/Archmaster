/**
 * Breadcrumb Component
 *
 * Displays navigation path for drill-down diagrams.
 * Shows hierarchical relationship from parent to current diagram.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Home,
  Layers,
  Box,
  GitBranch,
  Code,
} from 'lucide-react';
import type { Diagram } from '@/types';
import { useNavigationStore } from '@/store/navigationStore';

interface BreadcrumbItem {
  id: string;
  name: string;
  type: Diagram['type'];
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  onNavigate?: (diagramId: string) => void;
  showHome?: boolean;
  homeUrl?: string;
  className?: string;
}

/**
 * Get icon for diagram type
 */
function getDiagramIcon(type: Diagram['type']) {
  switch (type) {
    case 'system-context':
      return Layers;
    case 'container':
      return Box;
    case 'component':
      return GitBranch;
    case 'code':
      return Code;
    default:
      return Home;
  }
}

/**
 * Get color for diagram type
 */
function getDiagramColor(type: Diagram['type']): string {
  switch (type) {
    case 'system-context':
      return 'text-blue-600';
    case 'container':
      return 'text-purple-600';
    case 'component':
      return 'text-green-600';
    case 'code':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Breadcrumb component
 */
export function Breadcrumb({
  items,
  onNavigate,
  showHome = true,
  homeUrl = '/',
  className = '',
}: BreadcrumbProps) {
  const navigate = useNavigate();
  const { breadcrumbs, navigateBack } = useNavigationStore();

  // Use provided items or fallback to store
  const breadcrumbItems = items || breadcrumbs;

  const handleNavigate = useCallback(
    (diagramId: string, index: number) => {
      if (onNavigate) {
        onNavigate(diagramId);
      } else {
        navigate(`/editor/${diagramId}`);
      }
    },
    [navigate, onNavigate]
  );

  const handleHomeClick = useCallback(() => {
    navigate(homeUrl);
  }, [navigate, homeUrl]);

  if (breadcrumbItems.length === 0 && !showHome) {
    return null;
  }

  return (
    <nav className={`Breadcrumb flex items-center gap-2 text-sm ${className}`}>
      <ol className="flex items-center gap-2">
        {/* Home */}
        {showHome && (
          <li>
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              title="Go to home"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </button>
          </li>
        )}

        {/* Breadcrumb Items */}
        {breadcrumbItems.map((item, index) => {
          const Icon = getDiagramIcon(item.type);
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={item.id} className="flex items-center gap-2">
              {/* Separator */}
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />

              {/* Breadcrumb Link */}
              {isLast ? (
                // Current page (not clickable)
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900">
                  <Icon className={`w-4 h-4 ${getDiagramColor(item.type)}`} />
                  <span className="font-semibold">{item.name}</span>
                </div>
              ) : (
                // Parent page (clickable)
                <button
                  onClick={() => handleNavigate(item.id, index)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                >
                  <Icon className={`w-4 h-4 ${getDiagramColor(item.type)}`} />
                  <span className="font-medium">{item.name}</span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Simplified breadcrumb that shows just the path without icons
 */
export function SimpleBreadcrumb({
  items,
  onNavigate,
  separator = '/',
  className = '',
}: {
  items: Array<{ id: string; name: string }>;
  onNavigate?: (diagramId: string) => void;
  separator?: string;
  className?: string;
}) {
  return (
    <nav className={`SimpleBreadcrumb flex items-center gap-2 text-sm ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-gray-400 font-medium">{separator}</span>
            )}

            {isLast ? (
              <span className="font-semibold text-gray-900">{item.name}</span>
            ) : (
              <button
                onClick={() => onNavigate?.(item.id)}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {item.name}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
