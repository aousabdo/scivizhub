import React, { useState } from 'react';

/**
 * Export the current visualization as PNG or SVG.
 *
 * Props:
 *  - targetRef: React ref pointing to a <canvas> or <svg> element
 *  - filename: base filename without extension (default: "visualization")
 */
const ExportButton = ({ targetRef, filename = 'visualization' }) => {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportPNG = () => {
    const el = targetRef?.current;
    if (!el) return;
    setExporting(true);

    try {
      let dataURL;
      if (el.tagName === 'CANVAS') {
        dataURL = el.toDataURL('image/png');
      } else if (el.tagName === 'svg' || el.tagName === 'SVG') {
        // Convert SVG to canvas then to PNG
        const svgData = new XMLSerializer().serializeToString(el);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = el.clientWidth * 2; // 2x for retina
          canvas.height = el.clientHeight * 2;
          const ctx = canvas.getContext('2d');
          ctx.scale(2, 2);
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          triggerDownload(canvas.toDataURL('image/png'), `${filename}.png`);
          setExporting(false);
          setOpen(false);
        };
        img.src = url;
        return;
      } else {
        // Try to find a canvas or svg child
        const canvas = el.querySelector('canvas') || el.querySelector('svg');
        if (canvas?.tagName === 'CANVAS') {
          dataURL = canvas.toDataURL('image/png');
        } else {
          alert('No exportable element found.');
          setExporting(false);
          return;
        }
      }
      triggerDownload(dataURL, `${filename}.png`);
    } catch (err) {
      console.error('Export PNG failed:', err);
    }
    setExporting(false);
    setOpen(false);
  };

  const exportSVG = () => {
    const el = targetRef?.current;
    if (!el) return;

    let svgEl = el.tagName === 'svg' || el.tagName === 'SVG' ? el : el.querySelector('svg');
    if (!svgEl) {
      // For canvas elements, we can only export PNG
      alert('SVG export is only available for SVG-based visualizations. Use PNG instead.');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${filename}.svg`);
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Export visualization"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <button
            onClick={exportPNG}
            disabled={exporting}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {exporting ? 'Exporting...' : 'Download PNG'}
          </button>
          <button
            onClick={exportSVG}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Download SVG
          </button>
        </div>
      )}
    </div>
  );
};

function triggerDownload(href, filename) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default ExportButton;
