import React from 'react';
import ShareButton from './ShareButton';
import ExportButton from './ExportButton';

/**
 * Shared toolbar for all visualizations providing Share + Export buttons.
 *
 * Props:
 *  - canvasRef: ref to the canvas/svg element (for export)
 *  - shareURL: function returning the share URL (optional)
 *  - filename: export filename (default: "visualization")
 */
const VisualizationToolbar = ({ canvasRef, shareURL, filename = 'visualization' }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <ShareButton getURL={shareURL} />
      {canvasRef && <ExportButton targetRef={canvasRef} filename={filename} />}
    </div>
  );
};

export default VisualizationToolbar;
