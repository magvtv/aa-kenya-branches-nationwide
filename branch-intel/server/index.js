import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createCache } from './cache.js'

const app = express()
const PORT = Number(process.env.PORT) || 8787
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY || ''
const GEOAPIFY_AUTOCOMPLETE = 'https://api.geoapify.com/v1/geocode/autocomplete'

const cache = createCache({ max: 300, ttlMs: 60_000 })

app.use(cors())

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(GEOAPIFY_API_KEY),
    uptimeSec: Math.round(process.uptime()),
  })
})

app.get('/api/places/autocomplete', async (req, res) => {
  const q = String(req.query.q || '').trim()
  if (q.length < 2) return res.json({ items: [] })

  if (!GEOAPIFY_API_KEY) {
    return res.status(500).json({
      error: 'missing_api_key',
      message: 'GEOAPIFY_API_KEY is not set on the server.',
    })
  }

  const cacheKey = q.toLowerCase()
  const cached = cache.get(cacheKey)
  if (cached) return res.json(cached)

  const url = new URL(GEOAPIFY_AUTOCOMPLETE)
  url.searchParams.set('text', q)
  url.searchParams.set('apiKey', GEOAPIFY_API_KEY)
  url.searchParams.set('filter', 'countrycode:ke')
  url.searchParams.set('bias', 'proximity:36.8219,-1.2921')
  url.searchParams.set('limit', '6')
  url.searchParams.set('lang', 'en')
  url.searchParams.set('format', 'geojson')

  try {
    const upstream = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    })

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '')
      return res.status(502).json({
        error: 'upstream_error',
        status: upstream.status,
        detail: text.slice(0, 500),
      })
    }

    const raw = await upstream.json()
    const items = (raw?.features || []).map((feature) => {
      const p = feature.properties || {}
      const [lon, lat] = feature.geometry?.coordinates || [p.lon, p.lat]
      return {
        id: p.place_id || `${lat},${lon}`,
        label: p.formatted || [p.name, p.city, p.country].filter(Boolean).join(', '),
        city: p.city || p.county || p.state || null,
        lat,
        lon,
      }
    })

    const payload = { items }
    cache.set(cacheKey, payload)
    res.json(payload)
  } catch (err) {
    res.status(500).json({
      error: 'proxy_failure',
      message: err?.message || 'Unknown error contacting Geoapify.',
    })
  }
})

app.listen(PORT, () => {
   
  console.log(`[branch-intel] place-search proxy listening on http://localhost:${PORT}`)
  if (!GEOAPIFY_API_KEY) {
     
    console.warn('[branch-intel] WARNING: GEOAPIFY_API_KEY is not set. Autocomplete will return 500.')
  }
})
