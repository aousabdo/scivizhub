import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Lightweight guided-tour / onboarding overlay.
 *
 * Props:
 *  - steps: [{ target: CSS selector, title, content, placement? }]
 *  - storageKey: localStorage key to remember dismissal (default: "scivizhub-tour-seen")
 *  - onComplete: optional callback when tour finishes
 */
const GuidedTour = ({ steps = [], storageKey = 'scivizhub-tour-seen', onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState(null);
  const tooltipRef = useRef(null);

  // Only show the tour once per storageKey
  useEffect(() => {
    if (steps.length === 0) return;
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      // Small delay so the page renders first
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [steps.length, storageKey]);

  const positionTooltip = useCallback(() => {
    if (!visible || !steps[currentStep]) return;
    const step = steps[currentStep];
    const el = step.target ? document.querySelector(step.target) : null;

    if (el) {
      const rect = el.getBoundingClientRect();
      setHighlightRect({
        top: rect.top + window.scrollY - 4,
        left: rect.left + window.scrollX - 4,
        width: rect.width + 8,
        height: rect.height + 8,
      });

      const placement = step.placement || 'bottom';
      const tooltipW = 320;
      const gap = 12;
      let top, left;

      if (placement === 'bottom') {
        top = rect.bottom + window.scrollY + gap;
        left = rect.left + window.scrollX + rect.width / 2 - tooltipW / 2;
      } else if (placement === 'top') {
        top = rect.top + window.scrollY - gap - 160;
        left = rect.left + window.scrollX + rect.width / 2 - tooltipW / 2;
      } else if (placement === 'right') {
        top = rect.top + window.scrollY + rect.height / 2 - 80;
        left = rect.right + window.scrollX + gap;
      } else {
        top = rect.top + window.scrollY + rect.height / 2 - 80;
        left = rect.left + window.scrollX - tooltipW - gap;
      }

      // Keep tooltip on screen
      left = Math.max(8, Math.min(left, window.innerWidth - tooltipW - 8));
      top = Math.max(8, top);

      setPosition({ top, left });
    } else {
      // No target — center the tooltip
      setHighlightRect(null);
      setPosition({
        top: window.innerHeight / 2 - 80 + window.scrollY,
        left: window.innerWidth / 2 - 160,
      });
    }
  }, [currentStep, steps, visible]);

  useEffect(() => {
    positionTooltip();
    window.addEventListener('resize', positionTooltip);
    window.addEventListener('scroll', positionTooltip);
    return () => {
      window.removeEventListener('resize', positionTooltip);
      window.removeEventListener('scroll', positionTooltip);
    };
  }, [positionTooltip]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const finish = () => {
    setVisible(false);
    localStorage.setItem(storageKey, 'true');
    onComplete?.();
  };

  if (!visible || steps.length === 0) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{ background: 'rgba(0,0,0,0.45)' }}
        onClick={finish}
      />

      {/* Highlight cutout */}
      {highlightRect && (
        <div
          className="absolute z-[9999] rounded-lg pointer-events-none"
          style={{
            top: highlightRect.top,
            left: highlightRect.left,
            width: highlightRect.width,
            height: highlightRect.height,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
            border: '2px solid rgba(99,102,241,0.8)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute z-[10000] w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5"
        style={{ top: position.top, left: position.left }}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            Step {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={finish}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
          >
            Skip tour
          </button>
        </div>

        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">{step.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{step.content}</p>

        {/* Progress dots */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep
                    ? 'bg-indigo-500'
                    : i < currentStep
                    ? 'bg-indigo-300'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={prev}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={next}
              className="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuidedTour;
