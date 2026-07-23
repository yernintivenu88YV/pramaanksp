/**
 * Pramaan Backend API Client
 * Base path: /server/<module>. In local/demo mode the backend maps the
 * Authorization bearer token to an RBAC role; on Catalyst this is replaced by
 * the authenticated user's role details.
 */

let activeRole = 'SI';

export function setApiRole(role) {
  activeRole = role;
}

export function getApiRole() {
  return activeRole;
}

function normalizeError(data, status) {
  if (!data) return `HTTP Error ${status}`;
  if (typeof data === 'string') return data;
  if (data.error) return data.error;
  if (typeof data.detail === 'string') return data.detail;
  if (data.detail?.error) return data.detail.error;
  return `HTTP Error ${status}`;
}

export async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer role_${activeRole}`,
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(endpoint, { ...options, headers });
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    const exportMode = res.headers.get('X-Pramaan-Export-Mode');

    return {
      status: res.status,
      ok: res.ok,
      data,
      error: res.ok ? null : normalizeError(data, res.status),
      mode: exportMode || (isJson && data?.mode) || 'live',
      contentType,
    };
  } catch (err) {
    return {
      status: 0,
      ok: false,
      error: err.message || 'Network unreachable',
      data: null,
      mode: 'network_error',
      contentType: '',
    };
  }
}

export const api = {
  getHealth: () => apiFetch('/server/gateway_fn/health'),
  checkAccess: (resource) => apiFetch('/server/gateway_fn/check_access', { method: 'POST', body: JSON.stringify({ resource }) }),
  resolvePair: (recordA, recordB) => apiFetch('/server/entity_resolution_fn/resolve', { method: 'POST', body: JSON.stringify({ record_a: recordA, record_b: recordB }) }),
  matchCaseTwin: (target, candidates, topK = 4) => apiFetch('/server/case_twin_fn/match', { method: 'POST', body: JSON.stringify({ target, candidates, top_k: topK }) }),
  routeQuery: (query) => apiFetch('/server/intent_router_fn/route', { method: 'POST', body: JSON.stringify({ query }) }),
  routeVoice: (audioBase64, lang = 'kn') => apiFetch('/server/intent_router_fn/voice', { method: 'POST', body: JSON.stringify({ audio_base64: audioBase64, source_language: lang, tts: true }) }),
  traverseGraph: (canonicalId) => apiFetch('/server/graph_fn/traverse', { method: 'POST', body: JSON.stringify({ canonical_id: canonicalId }) }),
  getCommunities: () => apiFetch('/server/graph_fn/communities', { method: 'POST' }),
  getPriorityScores: (weights) => apiFetch('/server/graph_fn/priority', { method: 'POST', body: JSON.stringify(weights) }),
  getHotspots: () => apiFetch('/server/graph_fn/hotspots', { method: 'POST' }),
  exportDossierPdf: (caseId, topK = 3) => apiFetch('/server/export_fn/dossier_pdf', { method: 'POST', body: JSON.stringify({ case_id: caseId, top_k: topK }) }),
  exportConversationPdf: (sessionId) => apiFetch('/server/export_fn/conversation_pdf', { method: 'POST', body: JSON.stringify({ session_id: sessionId }) }),
};
