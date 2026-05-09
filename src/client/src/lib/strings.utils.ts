export const toTitle = (s: string | undefined) => (s && s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "")

export const maskKey = (key: string, hidden: number = 5) => {
    if (!key) return ""
    const visible = key.slice(0, hidden)
    const masked = "*".repeat(Math.max(0, key.length - hidden))
    return visible + masked
}
