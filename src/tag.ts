export type Position = "auto" | "float" | "left" | "none"

export interface WidgetOptions {
    key: string
    label: string
    color: string
    position: Position
}

export const SCRIPT_SRC = "https://onetagai.com/ask-docs.js"
export const REF = "framer"

const POSITIONS: Position[] = ["auto", "float", "left", "none"]

export function isValidKey(key: string): boolean {
    return /^ot_[A-Za-z0-9_-]{8,80}$/.test(key)
}

/** Hex color without "#", or null when it is not a 3 or 6 digit hex color. */
export function normalizeColor(color: string, expand = false): string | null {
    const c = color.trim().replace(/^#/, "")
    if (/^[0-9a-f]{6}$/i.test(c)) return c.toLowerCase()
    if (/^[0-9a-f]{3}$/i.test(c)) {
        const lower = c.toLowerCase()
        return expand ? lower.replace(/./g, ch => ch + ch) : lower
    }
    return null
}

function escapeAttr(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** The script tag that goes into the site's custom code, at the end of <body>. */
export function buildTag(options: WidgetOptions): string {
    const attrs: [string, string][] = [
        ["data-key", options.key.trim()],
        ["data-ref", REF],
    ]
    const label = options.label.trim().slice(0, 40)
    if (label) attrs.push(["data-label", label])
    const color = normalizeColor(options.color)
    if (color) attrs.push(["data-color", color])
    if (options.position !== "auto" && POSITIONS.includes(options.position)) attrs.push(["data-position", options.position])
    const rendered = attrs.map(([name, value]) => ` ${name}="${escapeAttr(value)}"`).join("")
    return `<script async src="${SCRIPT_SRC}"${rendered}></script>`
}

/** Read our options back from custom code HTML, or null when our tag is not in it. */
export function readTag(html: string): WidgetOptions | null {
    const doc = new DOMParser().parseFromString(html, "text/html")
    const script = doc.querySelector<HTMLScriptElement>(`script[src^="${SCRIPT_SRC}"]`)
    if (!script) return null
    const position = (script.dataset.position ?? "auto") as Position
    return {
        key: script.dataset.key ?? "",
        label: script.dataset.label ?? "",
        color: script.dataset.color ?? "",
        position: POSITIONS.includes(position) ? position : "auto",
    }
}
