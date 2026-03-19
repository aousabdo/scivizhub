const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const STORAGE_KEY = 'scivizhub_groq_api_key';
const MODEL = 'llama-3.3-70b-versatile';

// Proxy URL for users without their own key (set via REACT_APP_CHAT_PROXY_URL)
const PROXY_URL = process.env.REACT_APP_CHAT_PROXY_URL || '';

export function getApiKey() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function setApiKey(key) {
  localStorage.setItem(STORAGE_KEY, key.trim());
}

export function clearApiKey() {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasApiKey() {
  return Boolean(getApiKey());
}

/**
 * Returns true if chat is available — either the user has a key or a proxy is configured.
 */
export function isChatAvailable() {
  return hasApiKey() || Boolean(PROXY_URL);
}

/**
 * Returns true if using the rate-limited proxy (no user key, proxy configured).
 */
export function isUsingProxy() {
  return !hasApiKey() && Boolean(PROXY_URL);
}

/**
 * Send a chat message and stream the response.
 * Routes through the proxy when no user key is set, or directly to Groq otherwise.
 *
 * @param {Array} messages - Array of {role, content} message objects
 * @param {string} systemPrompt - System prompt for context
 * @param {function} onChunk - Callback for each streamed text chunk
 * @param {AbortSignal} signal - Optional abort signal
 * @returns {Promise<string>} Full response text
 */
export async function streamChat(messages, systemPrompt, onChunk, signal) {
  const apiKey = getApiKey();
  const useProxy = !apiKey && PROXY_URL;

  if (!apiKey && !PROXY_URL) {
    throw new Error('No API key configured. Please add your Groq API key.');
  }

  let response;

  if (useProxy) {
    // Route through the proxy
    response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt }),
      signal,
    });
  } else {
    // Direct to Groq with user's own key
    const body = {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    };

    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    });
  }

  if (!response.ok) {
    const errBody = await response.text();
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your Groq API key.');
    }
    if (response.status === 429) {
      if (useProxy) {
        throw new Error(
          'Free tier rate limit reached (20/hr). Add your own Groq API key in settings for unlimited access.'
        );
      }
      throw new Error('Rate limit reached. Please wait a moment and try again.');
    }
    try {
      const parsed = JSON.parse(errBody);
      throw new Error(parsed.error || `API error (${response.status})`);
    } catch {
      throw new Error(`API error (${response.status}): ${errBody}`);
    }
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter((line) => line.trim() !== '');

    for (const line of lines) {
      if (line === 'data: [DONE]') continue;
      if (!line.startsWith('data: ')) continue;

      try {
        const json = JSON.parse(line.slice(6));
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          onChunk(delta);
        }
      } catch {
        // Skip malformed chunks
      }
    }
  }

  return fullText;
}
