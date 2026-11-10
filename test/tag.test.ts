import { test } from "node:test"
import assert from "node:assert/strict"
import { buildTag, isValidKey, normalizeColor } from "../src/tag.ts"

test("minimal tag has key and ref only", () => {
    assert.equal(
        buildTag({ key: "ot_abc12345678", label: "", color: "", position: "auto" }),
        '<script async src="https://onetagai.com/ask-docs.js" data-key="ot_abc12345678" data-ref="framer"></script>',
    )
})

test("options are added and escaped", () => {
    const tag = buildTag({ key: "ot_abc12345678", label: 'Ask "us" <now>', color: "#FF6600", position: "left" })
    assert.match(tag, /data-label="Ask &quot;us&quot; &lt;now&gt;"/)
    assert.match(tag, /data-color="ff6600"/)
    assert.match(tag, /data-position="left"/)
    assert.equal(tag.match(/<script/g)?.length, 1)
})

test("bad color is dropped", () => {
    assert.doesNotMatch(buildTag({ key: "ot_abc12345678", label: "", color: "red", position: "auto" }), /data-color/)
    assert.equal(normalizeColor("abc", true), "aabbcc")
})

test("key format", () => {
    assert.ok(isValidKey("ot_demo000000000000000000000"))
    assert.ok(!isValidKey(""))
    assert.ok(!isValidKey("ot_"))
    assert.ok(!isValidKey('ot_abc" onload="x'))
})
