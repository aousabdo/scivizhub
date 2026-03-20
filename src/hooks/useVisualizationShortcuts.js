import { useEffect, useCallback } from 'react';

/**
 * Hook that adds keyboard shortcuts for visualization controls.
 * - Space: toggle play/pause
 * - R: reset (if provided)
 *
 * Only fires when no input/textarea/select is focused.
 */
export default function useVisualizationShortcuts({ onTogglePlay, onReset }) {
  const handleKeyDown = useCallback((e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      onTogglePlay?.();
    } else if (e.code === 'KeyR' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      onReset?.();
    }
  }, [onTogglePlay, onReset]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
