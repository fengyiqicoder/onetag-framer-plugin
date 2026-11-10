# Ask AI by OneTag for Framer

A Framer plugin that adds an Ask AI box to every page of your Framer site. A visitor types a question and gets a short answer written from your published pages, with links to them. The plugin writes one script tag into your site's custom code. It uses the hosted [OneTag AI](https://onetagai.com/?ref=framer) widget, so there is no backend to run.

## Features

- One small panel: site key, button label, color, position.
- "Add to site" puts the script at the end of `<body>` on every page. "Remove" takes it out.
- Shows what is installed now, and warns when the code is turned off in Site Settings.
- Answers from the current page, and from the whole site when it can find an `llms-full.txt` or a Pagefind index.

## Install

From the Framer Marketplace: search for "Ask AI by OneTag" in the Plugins menu.

From source:

```sh
npm install --registry https://registry.npmjs.org
npm run dev
```

Then in Framer open Plugins > Developer Tools > Open Development Plugin.

## Before you publish: get a free key

Click "Get a free key" in the plugin, go to [onetagai.com](https://onetagai.com/?ref=framer#get-key), or run:

```sh
curl -X POST https://onetagai.com/api/signup -H "Content-Type: application/json" -d '{"email":"you@example.com"}'
```

The key is public by design. It ends up in your page source, like an analytics ID. The free plan has 1,000,000 tokens a month with a hard cap. No bill can appear.

## Options

| Field | Script attribute | Values |
| --- | --- | --- |
| Site key | `data-key` | Your `ot_...` key. Required |
| Button label | `data-label` | Text, up to 40 characters. Default "Ask AI" |
| Color | `data-color` | Hex without `#`. Empty matches your site |
| Position | `data-position` | Auto, bottom right (`float`), bottom left (`left`), no button (`none`) |

`data-ref="framer"` is always set.

## How it works

The plugin calls the Framer Plugin API:

```ts
framer.setCustomCode({
  location: "bodyEnd",
  html: '<script async src="https://onetagai.com/ask-docs.js" data-key="ot_..." data-ref="framer"></script>',
})
```

It checks `useIsAllowedTo("setCustomCode")` first, and reads the current state with `framer.getCustomCode()` and `framer.subscribeToCustomCode()`. "Remove" sets `html` to `null`. Changes go live the next time you publish the site.

## Without a key

The "Add to site" button stays disabled until a key is entered. The widget has a demo key that only answers on `localhost`, which a Framer site never is, so you need your own key.

## Development

- `npm run dev` starts the plugin for Framer's development mode.
- `npm test` checks the generated script tag.
- `npm run build` type-checks and builds to `dist/`.
- `npm run pack` builds and writes `plugin.zip` for the Marketplace.

## License

MIT. See `LICENSE`.
