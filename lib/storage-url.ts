export function resolveFirebaseImageUrl(raw?: string) {
  if (!raw) return ""
  if (raw.startsWith("https://")) return raw

  if (raw.startsWith("gs://")) {
    const path = raw.replace("gs://", "")
    const separator = path.indexOf("/")
    if (separator === -1) return ""
    const bucket = path.slice(0, separator)
    const objectPath = path.slice(separator + 1)
    return `https://storage.googleapis.com/${bucket}/${objectPath}`
  }

  return ""
}
