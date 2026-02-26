type RateCacheEntry = {
  rate: number
  fetchedAt: number
  source: string
}

const CACHE_TTL_MS = 30 * 60 * 1000
const cache: { usdKes?: RateCacheEntry } = {}

function fallbackRate() {
  return Number(process.env.USD_TO_KES_RATE || 155)
}

export async function getUsdToKesRate() {
  const now = Date.now()
  if (cache.usdKes && now - cache.usdKes.fetchedAt < CACHE_TTL_MS) {
    return { ...cache.usdKes, cached: true }
  }

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 1800 },
    })
    if (!response.ok) throw new Error(`Rate API error: ${response.status}`)
    const payload = (await response.json()) as {
      rates?: Record<string, number>
    }
    const rate = Number(payload.rates?.KES || 0)
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("Invalid KES rate from API")

    cache.usdKes = {
      rate,
      fetchedAt: now,
      source: "open.er-api.com",
    }
    return { ...cache.usdKes, cached: false }
  } catch {
    const rate = fallbackRate()
    return {
      rate,
      fetchedAt: now,
      source: "fallback_env",
      cached: false,
    }
  }
}

