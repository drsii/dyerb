/**
 * @file workers/src/index.ts
 * @description Cloudflare Worker OAuth proxy for Battle.net API
 *
 * @author drsii
 * @ai-assisted Claude Opus 4.5 (claude-opus-4-5-20250514)
 * @license MIT
 * @copyright (c) 2025 drsii. All rights reserved.
 */

interface TokenRequest {
  clientId: string
  clientSecret: string
}

interface ApiProxyRequest {
  token: string
  region: string
  endpoint: string
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

// API base URLs by region
const API_URLS: Record<string, string> = {
  us: 'https://us.api.blizzard.com',
  eu: 'https://eu.api.blizzard.com',
  kr: 'https://kr.api.blizzard.com',
  tw: 'https://tw.api.blizzard.com'
}

export default {
  async fetch(request: Request): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    const url = new URL(request.url)

    try {
      // OAuth token endpoint
      if (url.pathname === '/api/token' && request.method === 'POST') {
        return await handleTokenRequest(request)
      }

      // API proxy endpoint
      if (url.pathname === '/api/proxy' && request.method === 'POST') {
        return await handleApiProxy(request)
      }

      // Health check
      if (url.pathname === '/health') {
        return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() })
      }

      return jsonResponse({ error: 'Not found' }, 404)
    } catch (error) {
      console.error('Worker error:', error)
      return jsonResponse(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        500
      )
    }
  }
}

async function handleTokenRequest(request: Request): Promise<Response> {
  const body: TokenRequest = await request.json()

  if (!body.clientId || !body.clientSecret) {
    return jsonResponse({ error: 'Missing clientId or clientSecret' }, 400)
  }

  const tokenUrl = 'https://oauth.battle.net/token'
  const credentials = btoa(`${body.clientId}:${body.clientSecret}`)

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`
    },
    body: 'grant_type=client_credentials'
  })

  const data = await response.json()

  if (!response.ok) {
    return jsonResponse(
      {
        error: 'Authentication failed',
        details: data
      },
      response.status
    )
  }

  return jsonResponse(data)
}

async function handleApiProxy(request: Request): Promise<Response> {
  const body: ApiProxyRequest = await request.json()

  if (!body.token || !body.region || !body.endpoint) {
    return jsonResponse({ error: 'Missing token, region, or endpoint' }, 400)
  }

  const baseUrl = API_URLS[body.region.toLowerCase()]
  if (!baseUrl) {
    return jsonResponse({ error: 'Invalid region' }, 400)
  }

  // Ensure endpoint starts with /
  const endpoint = body.endpoint.startsWith('/') ? body.endpoint : `/${body.endpoint}`
  const apiUrl = `${baseUrl}${endpoint}`

  // Parse existing query params and add locale if not present
  const urlObj = new URL(apiUrl)
  if (!urlObj.searchParams.has('locale')) {
    urlObj.searchParams.set('locale', 'en_US')
  }

  const response = await fetch(urlObj.toString(), {
    headers: {
      Authorization: `Bearer ${body.token}`
    }
  })

  const data = await response.json()

  if (!response.ok) {
    return jsonResponse(
      {
        error: 'API request failed',
        status: response.status,
        details: data
      },
      response.status
    )
  }

  return jsonResponse(data)
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS
    }
  })
}
