import React from 'react';
import { Helmet } from 'react-helmet';
import ChatButton from './ChatButton';

/**
 * Higher-order component that adds the AI chat button and SEO meta tags to a visualization page.
 * Usage: <WithChat id="bayes-theorem" title="Bayes' Theorem"><BayesTheoremPage /></WithChat>
 */
const WithChat = ({ id, title, children }) => {
  const pageTitle = `${title} — SciVizHub`;
  const description = `Interactive ${title} visualization. Explore, experiment, and learn with SciVizHub.`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      {children}
      <ChatButton visualizationId={id} visualizationTitle={title} />
    </>
  );
};

export default WithChat;
