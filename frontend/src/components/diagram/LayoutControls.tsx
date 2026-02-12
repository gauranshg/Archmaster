/**
 * Layout Controls Component
 *
 * Provides UI controls for applying automatic layouts to diagrams.
 */

import { useState, useCallback } from 'react';
import {
  Zap,
  Settings,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import {
  applyLayout,
  type LayoutOptions,
  LayoutDirection,
  LAYOUT_PRESETS,
} from '@/services/layout/layoutService';

interface LayoutControlsProps {
  onLayoutApply: (options: Partial<LayoutOptions>) => void;
  onLayoutReset?: () => void;
  nodeCount?: number;
  disabled?: boolean;
  isLayouting?: boolean;
}

export function LayoutControls({
  onLayoutApply,
  onLayoutReset,
  nodeCount = 0,
  disabled = false,
  isLayouting = false,
}: LayoutControlsProps) {
  const [direction, setDirection] = useState<LayoutDirection>('TB');
  const [preset, setPreset] = useState<string>('hierarchical');
  const [nodeSpacing, setNodeSpacing] = useState(50);
  const [rankSpacing, setRankSpacing] = useState(50);
  const [edgeSpacing, setEdgeSpacing] = useState(10);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDirectionChange = useCallback(
    (newDirection: LayoutDirection) => {
      setDirection(newDirection);
    },
    []
  );

  const handlePresetChange = useCallback((newPreset: string) => {
    setPreset(newPreset);
    const presetOptions = LAYOUT_PRESETS[newPreset];
    if (presetOptions) {
      setDirection(presetOptions.direction);
      setNodeSpacing(presetOptions.nodeSpacing);
      setRankSpacing(presetOptions.rankSpacing);
      setEdgeSpacing(presetOptions.edgeSpacing);
    }
  }, []);

  const handleApplyLayout = useCallback(() => {
    const options: Partial<LayoutOptions> = {
      direction,
      nodeSpacing,
      rankSpacing,
      edgeSpacing,
    };
    onLayoutApply(options);
  }, [direction, nodeSpacing, rankSpacing, edgeSpacing, onLayoutApply]);

  const directionOptions = [
    { value: 'TB' as LayoutDirection, label: 'Top → Bottom', icon: ArrowDown },
    { value: 'BT' as LayoutDirection, label: 'Bottom → Top', icon: ArrowUp },
    { value: 'LR' as LayoutDirection, label: 'Left → Right', icon: ArrowRight },
    { value: 'RL' as LayoutDirection, label: 'Right → Left', icon: ArrowLeft },
  ];

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Auto Layout</h3>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={showAdvanced ? 'Simple' : 'Advanced'}
        >
          <Settings className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Layout Preset</label>
        <select
          value={preset}
          onChange={(e) => handlePresetChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="hierarchical">Hierarchical</option>
          <option value="horizontal">Horizontal</option>
          <option value="compact">Compact</option>
          <option value="spacious">Spacious</option>
        </select>
      </div>

      {/* Direction Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Direction</label>
        <div className="grid grid-cols-2 gap-2">
          {directionOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => handleDirectionChange(option.value)}
                disabled={disabled}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  direction === option.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Node Spacing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Node Spacing</label>
              <span className="text-sm text-gray-600">{nodeSpacing}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              value={nodeSpacing}
              onChange={(e) => setNodeSpacing(Number(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Rank Spacing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Rank Spacing</label>
              <span className="text-sm text-gray-600">{rankSpacing}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              value={rankSpacing}
              onChange={(e) => setRankSpacing(Number(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Edge Spacing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Edge Spacing</label>
              <span className="text-sm text-gray-600">{edgeSpacing}px</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={edgeSpacing}
              onChange={(e) => setEdgeSpacing(Number(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>
        </div>
      )}

      {/* Node Count Info */}
      {nodeCount > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Layouting {nodeCount} node{nodeCount !== 1 ? 's' : ''}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleApplyLayout}
          disabled={disabled || isLayouting || nodeCount === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
        >
          {isLayouting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Layouting...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Apply Layout
            </>
          )}
        </button>
        {onLayoutReset && (
          <button
            onClick={onLayoutReset}
            disabled={disabled || isLayouting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export default LayoutControls;
