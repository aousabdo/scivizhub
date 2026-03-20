import React from 'react';

const Kbd = ({ children }) => (
  <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-600">
    {children}
  </kbd>
);

const KeyboardShortcutHint = ({ showReset = true }) => (
  <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 justify-center">
    <span><Kbd>Space</Kbd> Play / Pause</span>
    {showReset && <span><Kbd>R</Kbd> Reset</span>}
  </div>
);

export default KeyboardShortcutHint;
