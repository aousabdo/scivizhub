import React, { useState } from 'react';
import ChatDrawer from './ChatDrawer';

const ChatButton = ({ visualizationId, visualizationTitle }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
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

        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Ask AI about this topic
        </span>
      </button>

      {/* Chat drawer */}
      <ChatDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        visualizationId={visualizationId}
        visualizationTitle={visualizationTitle}
      />
    </>
  );
};

export default ChatButton;
