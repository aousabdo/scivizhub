import React, { useState, useRef, useEffect, useCallback } from 'react';
import { streamChat, setApiKey, hasApiKey, clearApiKey, isChatAvailable, isUsingProxy } from '../../services/groqService';
import { getVisualizationContext, getSuggestedQuestions } from '../../services/visualizationContexts';

const ChatDrawer = ({ isOpen, onClose, onMinimize, visualizationId, visualizationTitle }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(!isChatAvailable());
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !showKeyInput) {
      inputRef.current?.focus();
    }
  }, [isOpen, showKeyInput]);

  // Add welcome message when opening for the first time with chat available
  useEffect(() => {
    if (isOpen && messages.length === 0 && isChatAvailable()) {
      const proxyNote = isUsingProxy()
        ? '\n\nYou\'re using the free tier (20 msgs/hr). Add your own Groq API key in settings for unlimited access.'
        : '';
      setMessages([
        {
          role: 'assistant',
          content: `Hi! I'm SciViz AI. I can help you understand the **${visualizationTitle || 'visualization'}** you're viewing. Ask me anything — how it works, the math behind it, or real-world applications!${proxyNote}`,
        },
      ]);
      setShowSuggestions(true);
    }
  }, [isOpen, visualizationTitle]);

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    if (!trimmed.startsWith('gsk_')) {
      setError('Groq API keys start with "gsk_". Please check your key.');
      return;
    }
    setApiKey(trimmed);
    setShowKeyInput(false);
    setError('');
    setKeyInput('');
    setMessages([
      {
        role: 'assistant',
        content: `Hi! I'm SciViz AI. I can help you understand the **${visualizationTitle || 'visualization'}** you're viewing. Ask me anything!`,
      },
    ]);
    setShowSuggestions(true);
  };

  const handleRemoveKey = () => {
    clearApiKey();
    if (!isChatAvailable()) {
      setShowKeyInput(true);
    }
    setMessages([]);
  };

  const sendMessage = async (text) => {
    if (!text || isStreaming) return;

    setInput('');
    setError('');
    setShowSuggestions(false);

    const userMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Add a placeholder for the assistant response
    const assistantPlaceholder = { role: 'assistant', content: '' };
    setMessages([...updatedMessages, assistantPlaceholder]);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const systemPrompt = getVisualizationContext(visualizationId);

      // Only send the actual chat messages (not the welcome message if it was auto-generated)
      const chatHistory = updatedMessages
        .filter((m) => m.role === 'user' || (m.role === 'assistant' && updatedMessages.indexOf(m) > 0))
        .map(({ role, content }) => ({ role, content }));

      await streamChat(
        chatHistory,
        systemPrompt,
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: updated[lastIdx].content + chunk,
            };
            return updated;
          });
        },
        abortController.signal
      );
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
      // Remove the empty assistant placeholder on error
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[updated.length - 1].content === '') {
          updated.pop();
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    await sendMessage(text);
  };

  const handleSuggestionClick = (question) => {
    sendMessage(question);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat cleared! Ask me anything about the **${visualizationTitle || 'visualization'}**.`,
      },
    ]);
    setShowSuggestions(true);
  };

  if (!isOpen) return null;

  const suggestedQuestions = getSuggestedQuestions(visualizationId);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="font-semibold text-sm">SciViz AI</span>
            {isUsingProxy() && (
              <span className="text-xs bg-white bg-opacity-20 px-1.5 py-0.5 rounded">Free</span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="Clear chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={() => setShowKeyInput(true)}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="API key settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={onMinimize}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="Minimize"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 15l-6-6-6 6" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {showKeyInput ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-sm w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {isChatAvailable() ? 'Use Your Own API Key' : 'Set Up AI Chat'}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {isChatAvailable()
                    ? 'Add your own Groq API key for unlimited access (no rate limits).'
                    : 'To chat with SciViz AI, you need a free Groq API key.'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Groq API Key
                  </label>
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                    placeholder="gsk_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                  onClick={handleSaveKey}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Save & Start Chatting
                </button>

                {isChatAvailable() && (
                  <button
                    onClick={() => { setShowKeyInput(false); setError(''); }}
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    {hasApiKey() ? 'Cancel' : 'Continue with free tier'}
                  </button>
                )}

                <div className="text-center">
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Get a free API key at console.groq.com
                  </a>
                </div>

                {hasApiKey() && (
                  <button
                    onClick={handleRemoveKey}
                    className="w-full py-2 text-red-600 text-sm hover:text-red-800"
                  >
                    Remove saved key
                  </button>
                )}

                <p className="text-xs text-gray-500 text-center">
                  Your key is stored locally in your browser only. It is never sent to our servers.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>
                        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j}>{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                        {i < msg.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                    {isStreaming && idx === messages.length - 1 && msg.role === 'assistant' && (
                      <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}

              {/* Suggested questions */}
              {showSuggestions && messages.length <= 1 && !isStreaming && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(q)}
                      className="text-xs bg-white border border-blue-200 text-blue-700 rounded-full px-3 py-1.5 hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-2 bg-red-50 border-t border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-200 p-3">
              <div className="flex items-end space-x-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about this visualization..."
                  rows={1}
                  className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-32"
                  style={{ minHeight: '42px' }}
                  disabled={isStreaming}
                />
                {isStreaming ? (
                  <button
                    onClick={handleStop}
                    className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    title="Stop"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Send"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5 text-center">
                Powered by Llama 3.3 via Groq
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ChatDrawer;
