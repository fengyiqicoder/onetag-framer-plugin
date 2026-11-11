import { framer, useIsAllowedTo, type CustomCode } from "@framer/plugin"
import { useEffect, useState } from "react"
import "./App.css"
import { buildTag, isValidKey, normalizeColor, readTag, type Position, type WidgetOptions } from "./tag"

framer.showUI({
    position: "top right",
    width: 280,
    height: 452,
})

const SIGNUP_URL = "https://onetagai.com/?ref=framer#get-key"
const DOCS_URL = "https://onetagai.com/?ref=framer"

function useCustomCode() {
    const [customCode, setCustomCode] = useState<CustomCode | null>(null)
    useEffect(() => {
        let active = true
        framer.getCustomCode().then(code => {
            if (active) setCustomCode(code)
        })
        const unsubscribe = framer.subscribeToCustomCode(code => setCustomCode(code))
        return () => {
            active = false
            unsubscribe()
        }
    }, [])
    return customCode
}

const EMPTY: WidgetOptions = { key: "", label: "", color: "", position: "auto" }

export function App() {
    const customCode = useCustomCode()
    const canSetCode = useIsAllowedTo("setCustomCode")
    const installed = customCode?.bodyEnd.html ? readTag(customCode.bodyEnd.html) : null
    const disabled = customCode?.bodyEnd.disabled ?? false

    const [form, setForm] = useState<WidgetOptions>(EMPTY)
    const [loaded, setLoaded] = useState(false)
    const [busy, setBusy] = useState(false)

    // Fill the form once from what is already on the site.
    useEffect(() => {
        if (loaded || customCode === null) return
        if (installed) setForm(installed)
        setLoaded(true)
    }, [customCode, installed, loaded])

    const keyOk = isValidKey(form.key)
    const colorOk = form.color === "" || normalizeColor(form.color) !== null
    const update = (patch: Partial<WidgetOptions>) => setForm(f => ({ ...f, ...patch }))

    const add = async () => {
        if (!canSetCode || !keyOk || !colorOk) return
        setBusy(true)
        try {
            await framer.setCustomCode({ location: "bodyEnd", html: buildTag(form) })
            framer.notify(installed ? "Ask AI updated. Publish your site to see it." : "Ask AI added. Publish your site to see it.", { variant: "success" })
        } catch (error) {
            framer.notify("Could not add Ask AI: " + (error instanceof Error ? error.message : String(error)), { variant: "error" })
        } finally {
            setBusy(false)
        }
    }

    const remove = async () => {
        if (!canSetCode) return
        setBusy(true)
        try {
            await framer.setCustomCode({ location: "bodyEnd", html: null })
            framer.notify("Ask AI removed. Publish your site to apply.", { variant: "info" })
        } catch (error) {
            framer.notify("Could not remove Ask AI: " + (error instanceof Error ? error.message : String(error)), { variant: "error" })
        } finally {
            setBusy(false)
        }
    }

    let status = "Not on your site yet."
    if (customCode === null) status = "Reading site settings…"
    else if (installed && disabled) status = "Installed, but turned off in Site Settings > General > Custom Code."
    else if (installed) status = "Installed on every page. Publish to update the live site."

    return (
        <main>
            <p className={"status" + (installed && !disabled ? " on" : "")} role="status">
                <span className="dot" aria-hidden="true" />
                {status}
            </p>

            <label className="field">
                <span className="row">
                    <span>Site key</span>
                    <a href={SIGNUP_URL} target="_blank" rel="noreferrer">
                        Get a free key
                    </a>
                </span>
                <input
                    type="text"
                    value={form.key}
                    placeholder="ot_..."
                    spellCheck={false}
                    autoComplete="off"
                    onChange={e => update({ key: e.target.value.trim() })}
                />
                {form.key !== "" && !keyOk && <span className="hint error">A site key starts with ot_.</span>}
            </label>

            <label className="field">
                <span>Button label</span>
                <input type="text" value={form.label} maxLength={40} placeholder="Ask AI" onChange={e => update({ label: e.target.value })} />
            </label>

            <div className="pair">
                <label className="field">
                    <span>Color</span>
                    <span className="color">
                        <input
                            type="color"
                            aria-label="Pick a color"
                            value={normalizeColor(form.color) ? "#" + normalizeColor(form.color, true) : "#2563eb"}
                            onChange={e => update({ color: e.target.value.replace("#", "") })}
                        />
                        <input type="text" value={form.color} placeholder="auto" maxLength={7} onChange={e => update({ color: e.target.value.replace("#", "").trim() })} />
                    </span>
                    {!colorOk && <span className="hint error">Use a hex color like 2563eb.</span>}
                </label>

                <label className="field">
                    <span>Position</span>
                    <select value={form.position} onChange={e => update({ position: e.target.value as Position })}>
                        <option value="auto">Auto</option>
                        <option value="float">Bottom right</option>
                        <option value="left">Bottom left</option>
                        <option value="none">No button</option>
                    </select>
                </label>
            </div>

            <div className="actions">
                <button className="framer-button-primary" onClick={add} disabled={!canSetCode || !keyOk || !colorOk || busy}>
                    {installed ? "Update site" : "Add to site"}
                </button>
                <button onClick={remove} disabled={!canSetCode || !installed || busy}>
                    Remove
                </button>
            </div>

            {!canSetCode && <p className="hint">You need edit rights on this project to change its custom code.</p>}

            <p className="hint">
                The box answers visitor questions from your published pages. The key is public by design. Free plan: 1,000,000 tokens, one time, no monthly reset, hard cap, no bill.{" "}
                <a href={DOCS_URL} target="_blank" rel="noreferrer">
                    Learn more
                </a>
            </p>
        </main>
    )
}
