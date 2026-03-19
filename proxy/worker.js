/**
 * Cloudflare Worker — SciVizHub Groq API Proxy
 *
 * Forwards chat requests to Groq using a server-side API key,
 * so users can chat without providing their own key.
 *
 * Environment variables (set via `wrangler secret put`):
 *   GROQ_API_KEY — your Groq API key
 *
 * Rate limiting: uses Cloudflare's built-in rate limiting via the
 * RATE_LIMITER binding (configured in wrangler.toml).
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const MAX_TOKENS = 1024;

// In-memory sliding window rate limiter (per-isolate, best-effort)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 20; // requests per window

function isRateLimited(ip) {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);

  if (!entry) {
    entry = { timestamps: [] };
    rateLimitMap.set(ip, entry);
  }

  // Prune old entries
  entry.timestamps = entry.timestamps.filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (entry.timestamps.length >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.timestamps.push(now);
  return false;
}

// Clean up stale IPs periodically (prevent memory leak)
function pruneRateLimitMap() {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    entry.timestamps = entry.timestamps.filter(
      (t) => now - t < RATE_LIMIT_WINDOW_MS
    );
    if (entry.timestamps.length === 0) {
      rateLimitMap.delete(ip);
    }
  }
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Rate limit by IP
    const ip =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For') ||
      'unknown';

    if (isRateLimited(ip)) {
      // Periodic cleanup
      pruneRateLimitMap();
      return new Response(
        JSON.stringify({
          error:
            'Rate limit exceeded. You can make up to 20 requests per hour on the free tier. Add your own Groq API key in the chat settings for unlimited access.',
        }),
        {
          status: 429,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const { messages, systemPrompt } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Missing "messages" array in request body' }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    // Build Groq request
    const groqBody = {
      model: MODEL,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages,
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: MAX_TOKENS,
    };

    // Forward to Groq
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(groqBody),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      return new Response(
        JSON.stringify({
          error: `Groq API error (${groqResponse.status})`,
          details: errText,
        }),
        {
          status: groqResponse.status,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    // Stream the response back to the client
    return new Response(groqResponse.body, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  },
};
