export function extractStoragePathFromUrl(url: string) {
  if (!url) return ""

  if (url.startsWith("gs://")) {
    const path = url.replace("gs://", "")
    const slashIndex = path.indexOf("/")
    return slashIndex === -1 ? "" : path.slice(slashIndex + 1)
  }

  if (url.includes("/o/")) {
    try {
      const encoded = url.split("/o/")[1]?.split("?")[0] || ""
      return decodeURIComponent(encoded)
    } catch {
      return ""
    }
  }

  if (url.includes("storage.googleapis.com/")) {
    try {
      const parsed = new URL(url)
      const path = parsed.pathname.replace(/^\/+/, "")
      const segments = path.split("/")
      if (segments.length < 2) return ""
      return segments.slice(1).join("/")
    } catch {
      return ""
    }
  }

  return ""
}

export function collectStoragePathsFromValue(value: unknown): string[] {
  const found = new Set<string>()

  const visit = (input: unknown) => {
    if (!input) return
    if (typeof input === "string") {
      const path = extractStoragePathFromUrl(input)
      if (path) found.add(path)
      return
    }
    if (Array.isArray(input)) {
      input.forEach(visit)
      return
    }
    if (typeof input === "object") {
      Object.values(input as Record<string, unknown>).forEach(visit)
    }
  }

  visit(value)
  return Array.from(found)
}

