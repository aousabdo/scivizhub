import React from 'react';
import ChatButton from './ChatButton';

/**
 * Higher-order component that adds the AI chat button to a visualization page.
 * Usage: <WithChat id="bayes-theorem" title="Bayes' Theorem"><BayesTheoremPage /></WithChat>
 */
const WithChat = ({ id, title, children }) => {
  return (
    <>
      {children}
      <ChatButton visualizationId={id} visualizationTitle={title} />
    </>
  );
};

export default WithChat;
