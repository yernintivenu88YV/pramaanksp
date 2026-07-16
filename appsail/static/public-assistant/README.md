# Sahaaya — Public Help Desk (ConvoKraft path)

A **genuinely separate, unauthenticated** public assistant for general
procedural help (filing a complaint, helplines, station locator). It is
**not** the investigator interface — that remains the authenticated custom
React client in [`client_src/src/App.jsx`](../../client_src/src/App.jsx),
which stays exactly as built.

## Why ConvoKraft here, and *only* here

ConvoKraft (Catalyst's chatbot service) is **English-only in its NLU** and its
bots are **unauthenticated by default** — they cannot see the logged-in user's
identity. That makes it the wrong tool for anything touching case data, and the
*right* tool for a public FAQ. This is a deliberate architectural boundary, not
a limitation to work around by piping case data through the bot.

## Isolation contract (enforced, not aspirational)

`index.html` may only ever serve **static procedural content**. It must not:

- call `gateway_fn` / `entity_resolution_fn` / `case_twin_fn` / `graph_fn` /
  `intent_router_fn`, or any `/server/` endpoint;
- read case data, personal data, or the logged-in user's identity;
- use `window.catalyst` / `catalyst.auth`;
- make any active `fetch` / `XMLHttpRequest` / `WebSocket` call.

`test_isolation.py` scans every file in this folder and **fails** if any of the
above appears in active (non-comment) code, so the guarantee survives future
edits:

```
python test_isolation.py      # exits non-zero on any breach
```

The built-in "Ask Sahaaya" box answers from a **static keyword map, fully
offline** — no network at all — so isolation holds even before a real bot is
wired in.

## Deployment / URL

The page is plain static HTML served by Catalyst Web Client Hosting from
`client/`. After deploy it is reachable at:

```
https://<project-domain>/app/public-assistant/
```

No login is required — that is intended. Nothing sensitive is served here.

## Wiring the real ConvoKraft bot (Catalyst console — cannot be done from code)

1. Catalyst console → **ConvoKraft** → create a bot (e.g. `sahaaya-public`).
2. Build its flows/FAQ from **the same static content** in `index.html`
   (complaint steps, helplines, station locator). Do **not** add any flow that
   queries a Pramaan function or database.
3. Leave the bot **unauthenticated** (public). Do not attach it to the
   authenticated client.
4. Copy the console-generated embed `<script>` into the marked placeholder near
   the bottom of `index.html` (inside the existing comment block).
5. Re-run `python test_isolation.py` — the embed sits in a comment/`<script src>`
   and must not introduce any forbidden active call.

## Kannada note

The static content is bilingual (English + Kannada) for public readability. This
is display text only — there is no Kannada NLU here and no translation step,
because there is no reasoning over case data on this path at all.
