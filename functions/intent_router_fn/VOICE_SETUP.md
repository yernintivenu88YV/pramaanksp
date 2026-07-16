# Bhashini Voice Setup (ASR in / TTS out)

Voice is a thin layer over the **existing** intent-router pipeline — it is
**not** a separate reasoning path.

```
mic audio ──ASR (Bhashini)──▶ transcript ──▶ POST /intent_router_fn/route ──▶ result
                                                     │
                                          short confirmation ──TTS (Bhashini)──▶ spoken reply
```

- Endpoint: `POST /server/intent_router_fn/voice`
  Body: `{ "audio_base64": "<base64 audio>", "source_language": "kn"|"en", "tts": true }`
  Returns: `{ transcript, asr:{mode,language}, route:{…same as /route…}, tts:{audio_base64,mode} }`
- The transcript is fed into the same `/route` endpoint the typed UI uses, so
  RBAC (`own_case_detail`), LLM intent classification, and downstream routing
  are all reused. Kannada is transcribed and routed **in Kannada** — no
  translation step (consistent with `case_twin_fn` / `intent_router_fn`).

## Configuration (live mode)

Set these Catalyst environment variables (never hardcode; free PoC tier at
[bhashini.gov.in](https://bhashini.gov.in)):

| Var | Meaning |
|-----|---------|
| `BHASHINI_USER_ID` | ULCA user id |
| `BHASHINI_ULCA_API_KEY` | ULCA API key (pipeline config) |
| `BHASHINI_PIPELINE_ID` | Pipeline id (e.g. Bhashini/MeitY default) |
| `BHASHINI_CONFIG_URL` | (optional) override for `getModelsPipeline` |

Without these, `bhashini.py` runs in **mock mode**: ASR returns an empty
transcript and the `/voice` endpoint fails loudly (it never fabricates a
query), and TTS returns no audio. This mirrors `graph_fn`'s Neo4j-optional
degradation so the UI still works without a key.

## Known caveats (honest)

- **Audio format:** the browser `MediaRecorder` produces webm/ogg; Bhashini
  ASR prefers **16 kHz WAV**. A client-side or server-side re-encode to WAV is
  a production step (flagged in `App.jsx`). In mock mode the audio is unused.
- **Spoken summary:** `_speech_summary()` returns a short generic English
  confirmation. Localizing the spoken reply into Kannada is a follow-up (avoid
  a translate step for anything derived from case content).
- **Not testable in this environment:** no Bhashini key is present here, so the
  live ASR/TTS round trip has not been exercised end-to-end — only the mock
  path and the wiring have been verified.
