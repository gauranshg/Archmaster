/**
 * Export Controls Component
 *
 * Provides export options for diagrams including PNG, SVG with different resolutions.
 * Supports vector export (SVG) for scalable, editable diagrams.
 */

import { useState, useCallback } from 'react';
import { Download, ImageIcon, Check, PenTool, Image as ImageIcon2 } from 'lucide-react';
import { exportAndDownloadPNG, type PNGExportOptions } from '@/services/export/pngExport';
import { exportAndDownloadSVG, type SVGExportOptions } from '@/services/export/svgExport';

interface ExportControlsProps {
  /** The wrapper element containing React Flow */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Diagram name for filename */
  diagramName: string;
  /** Background color */
  backgroundColor?: string;
}

interface PNGExportOption {
  label: string;
  scale: number;
  description: string;
}

interface ExportFormat {
  id: 'png' | 'svg';
  label: string;
  icon: typeof PenTool;
  description: string;
}

const pngExportOptions: PNGExportOption[] = [
  { label: 'Standard (1x)', scale: 1, description: 'Standard resolution, smaller file size' },
  { label: 'High (2x)', scale: 2, description: 'High resolution for presentations' },
  { label: 'Ultra (3x)', scale: 3, description: 'Ultra HD for print' },
];

const exportFormats: ExportFormat[] = [
  {
    id: 'png',
    label: 'PNG',
    icon: ImageIcon2,
    description: 'Raster image for documents and web',
  },
  {
    id: 'svg',
    icon: PenTool,
    label: 'SVG',
    description: 'Vector image for editing and scaling',
  },
];

export function ExportControls({
  containerRef,
  diagramName,
  backgroundColor = '#ffffff',
}: ExportControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'svg'>('png');
  const [selectedPNGOption, setSelectedPNGOption] = useState<PNGExportOption>(pngExportOptions[1]);
  const [isExporting, setIsExporting] = useState(false);

  const handlePNGExport = useCallback(
    async (option: PNGExportOption) => {
      if (!containerRef.current || isExporting) return;

      setIsExporting(true);
      setIsOpen(false);

      try {
        const options: PNGExportOptions = {
          filename: diagramName || 'diagram',
          scale: option.scale,
          backgroundColor,
          padding: 40,
        };

        await exportAndDownloadPNG(containerRef.current, options);
        setSelectedPNGOption(option);
      } catch (error) {
        console.error('PNG export failed:', error);
        alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsExporting(false);
      }
    },
    [containerRef, diagramName, backgroundColor, isExporting]
  );

  const handleSVGExport = useCallback(
    async (transparent: boolean = false) => {
      if (!containerRef.current || isExporting) return;

      setIsExporting(true);
      setIsOpen(false);

      try {
        const options: SVGExportOptions = {
          filename: diagramName || 'diagram',
          backgroundColor: transparent ? 'transparent' : backgroundColor,
          padding: 40,
          embedImages: true,
          inlineStyles: true,
          includeMetadata: true,
        };

        await exportAndDownloadSVG(containerRef.current, options);
      } catch (error) {
        console.error('SVG export failed:', error);
        alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsExporting(false);
      }
    },
    [containerRef, diagramName, backgroundColor, isExporting]
  );

  const handleExport = useCallback(
    async (format: 'png' | 'svg', option?: PNGExportOption) => {
      if (format === 'png' && option) {
        await handlePNGExport(option);
      } else if (format === 'svg') {
        await handleSVGExport(false);
      }
    },
    [handlePNGExport, handleSVGExport]
  );

  return (
    <div className="relative">
      {/* Main export button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        title="Export diagram"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
        ) : (
          <Download size={18} />
        )}
      </button>

      {/* Export options dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute bottom-full right-0 mb-2 w-72 bg-white rounded-xl shadow-elevated border border-gray-200/50 z-50 animate-slide-in">
            {/* Format selection */}
            <div className="p-3 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-800 mb-2">Export Format</div>
              <div className="flex gap-2">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                        selectedFormat === format.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-xs font-medium">{format.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {exportFormats.find((f) => f.id === selectedFormat)?.description}
              </p>
            </div>

            {/* PNG resolution options */}
            {selectedFormat === 'png' && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-600 px-2 mb-1">Resolution</div>
                {pngExportOptions.map((option) => (
                  <button
                    key={option.scale}
                    onClick={() => handleExport('png', option)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700">
                          {option.label}
                        </span>
                        {selectedPNGOption.scale === option.scale && (
                          <Check size={14} className="text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* SVG options */}
            {selectedFormat === 'svg' && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-600 px-2 mb-1">Background</div>
                <button
                  onClick={() => handleSVGExport(false)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left group mb-1"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700">
                      Colored Background
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Uses current background color
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleSVGExport(true)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700">
                      Transparent Background
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Transparent for layering
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* Footer info */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <p className="text-xs text-gray-500">
                {selectedFormat === 'svg'
                  ? 'SVG files can be edited in Inkscape, Illustrator, or Figma'
                  : 'PNG files are suitable for documents and web'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
