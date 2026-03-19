# SciVizHub Chat Proxy

A lightweight Cloudflare Worker that proxies chat requests to the Groq API using a server-side API key, so users can chat without providing their own key.

## Setup

1. Install Wrangler (Cloudflare's CLI):
   ```bash
   npm install -g wrangler
   ```

2. Authenticate:
   ```bash
   wrangler login
   ```

3. Add your Groq API key as a secret:
   ```bash
   cd proxy
   wrangler secret put GROQ_API_KEY
   # Paste your key when prompted
   ```

4. Deploy:
   ```bash
   wrangler deploy
   ```

5. Set the proxy URL in your React app environment:
   ```bash
   # In the repo root, create/edit .env
   REACT_APP_CHAT_PROXY_URL=https://scivizhub-chat-proxy.<your-subdomain>.workers.dev
   ```

## Rate Limiting

The proxy rate-limits by IP address: **20 requests per hour** on the free tier. Users who provide their own Groq API key bypass the proxy entirely and have no rate limit.
