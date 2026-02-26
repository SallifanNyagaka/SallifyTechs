import { NextResponse } from "next/server"
import { getUsdToKesRate } from "@/lib/server/exchange-rate"

export const runtime = "nodejs"

export async function GET() {
  const data = await getUsdToKesRate()
  return NextResponse.json({
    base: "USD",
    target: "KES",
    rate: data.rate,
    source: data.source,
    fetchedAt: new Date(data.fetchedAt).toISOString(),
    cached: data.cached,
  })
}

