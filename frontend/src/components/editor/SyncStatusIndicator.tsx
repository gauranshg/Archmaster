/**
 * Sync Status Indicator Component
 *
 * Displays the current synchronization status between visual and code editors.
 * Shows visual feedback for sync state (syncing, synced, error, pending changes).
 */

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { SyncState } from '@/services/sync';
import './SyncStatusIndicator.css';

/**
 * Props for SyncStatusIndicator
 */
export interface SyncStatusIndicatorProps {
  /** Current sync state */
  state: SyncState;

  /** Whether to show detailed status text */
  showText?: boolean;

  /** Custom class name */
  className?: string;

  /** Click handler (e.g., to force sync) */
  onClick?: () => void;
}

/**
 * Gets the appropriate icon for sync status
 */
function getStatusIcon(status: SyncState['status']): React.ReactNode {
  switch (status) {
    case 'syncing':
      return <Loader2 className="sync-icon spinning" size={16} />;
    case 'synced':
      return <CheckCircle2 className="sync-icon success" size={16} />;
    case 'error':
      return <AlertCircle2 className="sync-icon error" size={16} />;
    case 'idle':
    default:
      return <Clock className="sync-icon idle" size={16} />;
  }
}

/**
 * Gets the status text
 */
function getStatusText(state: SyncState): string {
  if (state.error) {
    return `Sync error: ${state.error.message}`;
  }

  if (state.status === 'syncing') {
    return 'Syncing...';
  }

  if (state.status === 'synced') {
    const timeSinceSync = Date.now() - state.lastSyncTime;

    if (timeSinceSync < 1000) {
      return 'Just synced';
    } else if (timeSinceSync < 60000) {
      return `Synced ${Math.floor(timeSinceSync / 1000)}s ago`;
    } else {
      return `Synced ${Math.floor(timeSinceSync / 60000)}m ago`;
    }
  }

  if (state.visualChangesPending || state.codeChangesPending) {
    return 'Changes pending';
  }

  return 'Synced';
}

/**
 * Gets the CSS class for sync status
 */
function getStatusClass(state: SyncState): string {
  if (state.error) {
    return 'sync-status-error';
  }

  if (state.status === 'syncing') {
    return 'sync-status-syncing';
  }

  if (state.status === 'synced') {
    return state.visualChangesPending || state.codeChangesPending
      ? 'sync-status-pending'
      : 'sync-status-synced';
  }

  return 'sync-status-idle';
}

/**
 * Sync status indicator component
 */
export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  state,
  showText = true,
  className = '',
  onClick,
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  // Update time ago display every second when synced
  useEffect(() => {
    if (state.status === 'synced' && state.lastSyncTime > 0) {
      const updateTime = () => {
        const timeSinceSync = Date.now() - state.lastSyncTime;

        if (timeSinceSync < 1000) {
          setTimeAgo('Just synced');
        } else if (timeSinceSync < 60000) {
          setTimeAgo(`Synced ${Math.floor(timeSinceSync / 1000)}s ago`);
        } else {
          setTimeAgo(`Synced ${Math.floor(timeSinceSync / 60000)}m ago`);
        }
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);

      return () => clearInterval(interval);
    }
  }, [state.status, state.lastSyncTime]);

  const statusText = timeAgo || getStatusText(state);
  const statusClass = getStatusClass(state);
  const hasPendingChanges = state.visualChangesPending || state.codeChangesPending;

  return (
    <div
      className={`sync-status-indicator ${statusClass} ${hasPendingChanges ? 'has-pending' : ''} ${className}`.trim()}
      onClick={onClick}
      title={state.error ? state.error.message : 'Sync status'}
      role="status"
      aria-live="polite"
      aria-label={statusText}
    >
      <div className="sync-status-icon-wrapper">
        {getStatusIcon(state.status)}
      </div>

      {showText && (
        <div className="sync-status-text">
          <span className="sync-status-label">{statusText}</span>

          {hasPendingChanges && !state.error && (
            <span className="sync-status-pending-badge">
              {state.visualChangesPending && state.codeChangesPending
                ? 'Visual + Code'
                : state.visualChangesPending
                ? 'Visual'
                : 'Code'}
            </span>
          )}
        </div>
      )}

      {state.lastSyncDirection && (
        <div className="sync-status-direction" aria-hidden="true">
          {state.lastSyncDirection === 'visual-to-code' ? '→ Code' : '→ Visual'}
        </div>
      )}
    </div>
  );
};

/**
 * Compact version of sync status indicator (icon only)
 */
export const CompactSyncStatus: React.FC<
  Omit<SyncStatusIndicatorProps, 'showText'>
> = (props) => {
  return <SyncStatusIndicator {...props} showText={false} />;
};

/**
 * Sync status button with click-to-force-sync functionality
 */
export const SyncStatusButton: React.FC<
  SyncStatusIndicatorProps & {
    onForceSync?: () => void;
    isSyncing?: boolean;
  }
> = ({ state, onForceSync, isSyncing = false, ...props }) => {
  const handleClick = () => {
    if (!isSyncing && onForceSync) {
      onForceSync();
    }
    props.onClick?.();
  };

  return (
    <button
      className={`sync-status-button ${getStatusClass(state)}`.trim()}
      onClick={handleClick}
      disabled={isSyncing}
      aria-label={isSyncing ? 'Syncing...' : 'Force sync'}
    >
      <SyncStatusIndicator state={state} {...props} />
    </button>
  );
};
