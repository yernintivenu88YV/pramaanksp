/**
 * Pramaan Backend API Client
 * Base path: /server/<module>
 * Automatically attaches Authorization headers based on active RBAC role (SI, ACP, Analyst, Policy).
 */

let activeRole = 'SI'; // Default role

export function setApiRole(role) {
  activeRole = role;
}

export function getApiRole() {
  return activeRole;
}

export async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer role_${activeRole}`,
    ...(options.headers || {})
  };

  try {
    const res = await fetch(endpoint, { ...options, headers });
    const data = await res.json().catch(() => ({ error: 'Invalid JSON response from server' }));
    
    return {
      status: res.status,
      ok: res.ok,
      data,
      mode: data.mode || (res.headers.get('X-Pramaan-Export-Mode') ? 'smartbrowz' : 'live')
    };
  } catch (err) {
    return {
      status: 0,
      ok: false,
      error: err.message || 'Network unreachable',
      data: null,
      mode: 'mock_error'
    };
  }
}

// Module Endpoints
export const api = {
  // Gateway & Health
  getHealth: () => apiFetch('/server/gateway_fn/health'),
  checkAccess: (resource) => apiFetch('/server/gateway_fn/check_access', { method: 'POST', body: JSON.stringify({ resource }) }),

  // Entity Resolution
  resolvePair: (recordA, recordB) => apiFetch('/server/entity_resolution_fn/resolve', { method: 'POST', body: JSON.stringify({ record_a: recordA, record_b: recordB }) }),

  // Case-Twin Matching
  matchCaseTwin: (target, candidates, topK = 4) => apiFetch('/server/case_twin_fn/match', { method: 'POST', body: JSON.stringify({ target, candidates, top_k: topK }) }),

  // Intent & Voice Router
  routeQuery: (query) => apiFetch('/server/intent_router_fn/route', { method: 'POST', body: JSON.stringify({ query }) }),
  routeVoice: (audioBase64, lang = 'kn') => apiFetch('/server/intent_router_fn/voice', { method: 'POST', body: JSON.stringify({ audio_base64: audioBase64, source_language: lang, tts: true }) }),

  // Graph Analytics & Hotspots
  traverseGraph: (canonicalId) => apiFetch('/server/graph_fn/traverse', { method: 'POST', body: JSON.stringify({ canonical_id: canonicalId }) }),
  getCommunities: () => apiFetch('/server/graph_fn/communities', { method: 'POST' }),
  getPriorityScores: (weights) => apiFetch('/server/graph_fn/priority', { method: 'POST', body: JSON.stringify(weights) }),
  getHotspots: () => apiFetch('/server/graph_fn/hotspots', { method: 'POST' }),

  // Exports
  exportDossierPdf: (canonicalId, caseId) => apiFetch('/server/export_fn/dossier_pdf', { method: 'POST', body: JSON.stringify({ canonical_id: canonicalId, case_id: caseId }) }),
  exportConversationPdf: (sessionId) => apiFetch('/server/export_fn/conversation_pdf', { method: 'POST', body: JSON.stringify({ session_id: sessionId }) })
};
