export const COS_IMAGE_BASE_URL = "https://claude.artimg.top"

export function resolveCosImageUrl(url?: string | null) {
  const value = String(url || "").trim()
  if (!value) return value
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith("/")) return `${COS_IMAGE_BASE_URL}${value}`
  return `${COS_IMAGE_BASE_URL}/${value}`
}
