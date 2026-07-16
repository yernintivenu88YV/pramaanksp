import os
import logging
import requests

logger = logging.getLogger("appsail.bhashini")
logger.setLevel(logging.INFO)

CONFIG_URL = os.getenv(
    "BHASHINI_CONFIG_URL",
    "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline",
)

def is_configured() -> bool:
    return bool(
        os.getenv("BHASHINI_USER_ID")
        and os.getenv("BHASHINI_ULCA_API_KEY")
        and os.getenv("BHASHINI_PIPELINE_ID")
    )

def _pipeline_config(tasks: list) -> dict:
    headers = {
        "userID": os.getenv("BHASHINI_USER_ID"),
        "ulcaApiKey": os.getenv("BHASHINI_ULCA_API_KEY"),
        "Content-Type": "application/json",
    }
    body = {
        "pipelineTasks": tasks,
        "pipelineRequestConfig": {"pipelineId": os.getenv("BHASHINI_PIPELINE_ID")},
    }
    resp = requests.post(CONFIG_URL, json=body, headers=headers, timeout=15)
    resp.raise_for_status()
    return resp.json()

def _inference_endpoint(cfg: dict):
    ep = cfg["pipelineInferenceAPIEndPoint"]
    auth = ep["inferenceApiKey"]
    return ep["callbackUrl"], {auth["name"]: auth["value"]}

def _service_id(cfg: dict, task_type: str) -> str:
    for t in cfg.get("pipelineResponseConfig", []):
        if t.get("taskType") == task_type:
            return t["config"][0]["serviceId"]
    raise RuntimeError(f"No Bhashini service resolved for task '{task_type}'")

def asr(audio_base64: str, source_language: str = "kn") -> dict:
    if not is_configured():
        logger.warning("Bhashini not configured; ASR returning mock transcript.")
        return {
            "transcript": "",
            "language": source_language,
            "mode": "mock",
            "note": "Bhashini key not set; wire BHASHINI_* env vars for live ASR.",
        }
    try:
        cfg = _pipeline_config([{"taskType": "asr", "config": {"language": {"sourceLanguage": source_language}}}])
        url, auth_headers = _inference_endpoint(cfg)
        service_id = _service_id(cfg, "asr")
        payload = {
            "pipelineTasks": [{
                "taskType": "asr",
                "config": {"language": {"sourceLanguage": source_language},
                           "serviceId": service_id, "audioFormat": "wav",
                           "samplingRate": 16000},
            }],
            "inputData": {"audio": [{"audioContent": audio_base64}]},
        }
        r = requests.post(url, json=payload, headers=auth_headers, timeout=30)
        r.raise_for_status()
        out = r.json()
        text = out["pipelineResponse"][0]["output"][0]["source"]
        return {"transcript": text, "language": source_language, "mode": "live"}
    except Exception as e:
        logger.error(f"Bhashini ASR failed: {e}")
        return {"transcript": "", "language": source_language, "mode": "error", "error": str(e)}

def tts(text: str, target_language: str = "kn") -> dict:
    if not text or not is_configured():
        return {"audio_base64": "", "mode": "mock",
                "note": "Bhashini key not set or empty text; no TTS audio."}
    try:
        cfg = _pipeline_config([{"taskType": "tts", "config": {"language": {"sourceLanguage": target_language}}}])
        url, auth_headers = _inference_endpoint(cfg)
        service_id = _service_id(cfg, "tts")
        payload = {
            "pipelineTasks": [{
                "taskType": "tts",
                "config": {"language": {"sourceLanguage": target_language},
                           "serviceId": service_id, "gender": "female",
                           "samplingRate": 16000},
            }],
            "inputData": {"input": [{"source": text}]},
        }
        r = requests.post(url, json=payload, headers=auth_headers, timeout=30)
        r.raise_for_status()
        out = r.json()
        audio_b64 = out["pipelineResponse"][0]["audio"][0]["audioContent"]
        return {"audio_base64": audio_b64, "mode": "live"}
    except Exception as e:
        logger.error(f"Bhashini TTS failed: {e}")
        return {"audio_base64": "", "mode": "error", "error": str(e)}
