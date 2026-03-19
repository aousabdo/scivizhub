import React, { useState, useEffect } from 'react';
import ChatDrawer from './ChatDrawer';

const SEEN_KEY = 'scivizhub_chat_seen';

const ChatButton = ({ visualizationId, visualizationTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(SEEN_KEY);

    if (!hasSeen) {
      // First visit: auto-open the chat drawer after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(SEEN_KEY, 'true');
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Subsequent visits: show a floating hint bubble
      const timer = setTimeout(() => setShowHint(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-hide hint after 8 seconds
  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(timer);
  }, [showHint]);

  const handleOpen = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      setIsOpen(true);
    }
    setShowHint(false);
  };

  const handleMinimize = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating hint bubble */}
      {showHint && !isOpen && (
        <div className="fixed bottom-24 right-6 z-30 animate-bounce-subtle">
          <div className="relative bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-2.5 max-w-[220px]">
            <p className="text-sm text-gray-700 font-medium">
              Have questions? Ask AI about this visualization!
            </p>
            <button
              onClick={() => setShowHint(false)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-xs transition-colors"
              aria-label="Dismiss hint"
            >
              &times;
            </button>
            {/* Arrow pointing down to the chat button */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45" />
          </div>
        </div>
      )}

      {/* Minimized bar */}
      {isMinimized && !isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-30 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center space-x-2 pl-4 pr-3 py-2.5 group"
          title="Restore chat"
          aria-label="Restore AI chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-sm font-medium">SciViz AI</span>
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </button>
      )}

      {/* Floating button (only when not minimized) */}
      {!isMinimized && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
          title="Ask AI about this visualization"
          aria-label="Open AI chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>

          {/* Tooltip (shown on hover when hint is not visible) */}
          {!showHint && (
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Ask AI about this topic
            </span>
          )}
        </button>
      )}

      {/* Chat drawer */}
      <ChatDrawer
        isOpen={isOpen}
        onClose={handleClose}
        onMinimize={handleMinimize}
        visualizationId={visualizationId}
        visualizationTitle={visualizationTitle}
      />
    </>
  );
};

export default ChatButton;
