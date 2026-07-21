"""
export_fn.py -- Court-ready PDF export via Catalyst SmartBrowz.

Two exports, both explicit requirements:
  POST /server/export_fn/conversation_pdf -- the original brief's PDF export
      of conversation history, read from ConversationLog (written by
      intent_router_fn._log_conversation on every answered /route query).
  POST /server/export_fn/dossier_pdf -- the roadmap's court-ready case
      dossier: case facts, resolved suspects (canonical IDs), narrative/
      case-twin similarity evidence, associate clusters, spatial hotspots,
      and the AccessAuditLog trail.

PDF rendering uses Catalyst SmartBrowz (app.smart_browz().convert_to_pdf),
the platform's own HTML->PDF service -- not a generic Python PDF library.
SmartBrowz needs live Catalyst credentials, so in local/fallback mode the
endpoints return the fully-composed HTML with an explicit
X-Pramaan-Export-Mode: fallback_html_no_smartbrowz header instead of
pretending a PDF was produced. Same fail-honest posture as graph_fn/mock
and bhashini mock mode.

Both endpoints sit behind the RBAC middleware under own_case_detail
(SI/ACP only) -- a dossier is person-level case data. Every export request
is therefore itself audit-logged, and lands in the very audit trail the
dossier prints.

Kannada content (queries, narratives) is passed through verbatim -- the
HTML declares UTF-8 and never translates.
"""
import html as html_escape
import json
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel

from . import case_twin_fn as ct
from . import graph_fn as gf

logger = logging.getLogger("appsail.export")
router = APIRouter(prefix="/server/export_fn")


class ConversationExportRequest(BaseModel):
    session_id: Optional[str] = None   # omit -> all sessions visible to caller


class DossierRequest(BaseModel):
    case_id: str
    top_k: int = 3


# ---------------------------------------------------------------------------
# Rendering helpers
# ---------------------------------------------------------------------------

def _esc(value) -> str:
    return html_escape.escape("" if value is None else str(value))


_PAGE_CSS = """
  body { font-family: 'Segoe UI', 'Noto Sans', 'Noto Sans Kannada', sans-serif;
         color: #1f2937; margin: 32px; font-size: 13px; }
  h1 { font-size: 20px; border-bottom: 3px solid #0f2a4a; padding-bottom: 6px; }
  h2 { font-size: 15px; color: #0f2a4a; margin-top: 22px;
       border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid #cbd5e1; padding: 5px 7px; text-align: left;
           vertical-align: top; }
  th { background: #eef2f7; }
  .meta { color: #475569; font-size: 11px; }
  .badge { background: #eef2ff; border-radius: 3px; padding: 1px 6px;
           font-weight: 600; }
  .note { background: #fffbeb; border: 1px solid #fcd34d; padding: 8px 10px;
          border-radius: 4px; font-size: 11px; margin-top: 18px; }
"""


def _page(title: str, generated_for: str, body: str) -> str:
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>{_esc(title)}</title><style>{_PAGE_CSS}</style></head>
<body>
  <h1>{_esc(title)}</h1>
  <p class="meta">Pramaan &mdash; Karnataka State Police crime-intelligence gateway<br>
     Generated: {generated_at} &nbsp;|&nbsp; Requested by role: <span class="badge">{_esc(generated_for)}</span></p>
  {body}
  <div class="note">This document was generated from Pramaan's audited data
  stores. Access to the underlying records is role-gated and every access --
  including the generation of this document -- is written to the immutable
  AccessAuditLog table printed above where included. Kannada text appears in
  its original script; no machine translation has been applied.</div>
</body></html>"""


def _conversation_html(rows: list, role: str) -> str:
    body_rows = ""
    for r in rows:
        cited = r.get("cited_record_ids") or "[]"
        try:
            cited_list = json.loads(cited) if isinstance(cited, str) else cited
        except Exception:
            cited_list = [cited]
        body_rows += (
            "<tr>"
            f"<td class='meta'>{_esc(r.get('timestamp'))}</td>"
            f"<td>{_esc(r.get('role'))}</td>"
            f"<td>{_esc(r.get('query_text'))}</td>"
            f"<td>{_esc(', '.join(str(c) for c in cited_list))}</td>"
            "</tr>"
        )
    body = f"""
  <h2>Conversation history ({len(rows)} entries)</h2>
  <table>
    <tr><th style="width:130px">Timestamp (UTC)</th><th style="width:60px">Role</th>
        <th>Query</th><th style="width:180px">Cited records</th></tr>
    {body_rows}
  </table>"""
    return _page("Conversation History Export", role, body)


def _dossier_html(role: str, target: dict, suspects: list, twin_result: dict,
                  communities: dict, hotspots: dict, audit_rows: list) -> str:
    case_rows = "".join(
        f"<tr><th style='width:160px'>{_esc(k)}</th><td>{_esc(v)}</td></tr>"
        for k, v in (
            ("Case ID", target.get("case_id")),
            ("FIR number", target.get("fir_number")),
            ("Station", target.get("station_id")),
            ("Crime type", target.get("crime_type")),
            ("Modus operandi", target.get("modus_operandi")),
            ("Date / time", target.get("date_time")),
            ("Narrative", target.get("narrative_text")),
        ))

    suspect_rows = "".join(
        "<tr>"
        f"<td>{_esc(s.get('canonical_id'))}</td><td>{_esc(s.get('name'))}</td>"
        f"<td>{_esc(s.get('age'))}</td><td>{_esc(s.get('phone'))}</td>"
        f"<td>{_esc(s.get('address'))}</td>"
        "</tr>"
        for s in suspects) or "<tr><td colspan='5'>No resolved suspects linked.</td></tr>"

    twin_rows = ""
    for m in twin_result.get("top_matches", []):
        b = m.get("breakdown", {})
        twin_rows += (
            "<tr>"
            f"<td>{_esc(m.get('case_id'))}</td>"
            f"<td>{m.get('total_score'):.3f}</td>"
            f"<td>{b.get('narrative', 0):.2f}</td>"
            f"<td>{b.get('mo', 0):.2f}</td>"
            f"<td>{b.get('location', 0):.2f}</td>"
            f"<td>{'yes' if m.get('shared_confirmed_suspect') else 'no'}</td>"
            "</tr>")
    flagged_rows = "".join(
        f"<tr><td>{_esc(m.get('case_id'))}</td><td colspan='5'>Shares a confirmed "
        f"canonical suspect with the target (similarity {m.get('total_score'):.3f})</td></tr>"
        for m in twin_result.get("flagged_linkages", []))

    community_rows = "".join(
        f"<tr><td>Cluster #{_esc(c.get('communityId'))}</td>"
        f"<td>{_esc(c.get('name'))}</td><td>{_esc(c.get('canonical_id'))}</td></tr>"
        for c in communities.get("communities", [])) or \
        "<tr><td colspan='3'>No associate clusters available.</td></tr>"

    hotspot_rows = "".join(
        f"<tr><td>{_esc(h.get('cluster_id'))}</td><td>{h.get('density')}</td>"
        f"<td>{_esc(h.get('primary_crime'))}</td>"
        f"<td>{h.get('latitude')}, {h.get('longitude')}</td>"
        f"<td>{_esc(', '.join(h.get('case_ids', [])))}</td></tr>"
        for h in hotspots.get("hotspots", []))

    audit_table_rows = "".join(
        f"<tr><td class='meta'>{_esc(a.get('timestamp'))}</td><td>{_esc(a.get('role'))}</td>"
        f"<td>{_esc(a.get('resource'))}</td><td>{_esc(a.get('decision'))}</td></tr>"
        for a in audit_rows) or "<tr><td colspan='4'>No audit rows available.</td></tr>"

    body = f"""
  <h2>1. Case record</h2>
  <table>{case_rows}</table>

  <h2>2. Resolved suspects (canonical identities via entity resolution)</h2>
  <table><tr><th>Canonical ID</th><th>Name</th><th>Age</th><th>Phone</th><th>Address</th></tr>
  {suspect_rows}</table>

  <h2>3. Case-twin similarity evidence (mode: {_esc(twin_result.get('mode', 'computed'))})</h2>
  <table><tr><th>Case</th><th>Total</th><th>Narrative</th><th>MO</th><th>Location</th><th>Shared suspect</th></tr>
  {twin_rows}{flagged_rows}</table>

  <h2>4. Associate clusters (mode: {_esc(communities.get('mode'))})</h2>
  <table><tr><th>Cluster</th><th>Name</th><th>Canonical ID</th></tr>{community_rows}</table>

  <h2>5. Spatial hotspots (mode: {_esc(hotspots.get('mode'))})</h2>
  <table><tr><th>Hotspot</th><th>Density</th><th>Primary crime</th><th>Centroid</th><th>Cases</th></tr>
  {hotspot_rows}</table>

  <h2>6. Access audit trail (AccessAuditLog, most recent)</h2>
  <table><tr><th>Timestamp (UTC)</th><th>Role</th><th>Resource</th><th>Decision</th></tr>
  {audit_table_rows}</table>"""
    return _page(f"Court-Ready Case Dossier — {target.get('case_id')}", role, body)


# ---------------------------------------------------------------------------
# SmartBrowz rendering (live) with honest HTML fallback (local)
# ---------------------------------------------------------------------------

def _render(repo, html: str, filename: str) -> Response:
    """
    Live Catalyst -> SmartBrowz HTML-to-PDF (application/pdf). Otherwise the
    composed HTML is returned unchanged with an explicit fallback header --
    never a fake or empty "PDF".

    SmartBrowz depends on having a live Catalyst app (admin credentials),
    NOT on whether the Data Store has tables -- so gate on repo.app, not on
    repo.is_fallback(). This lets the real PDF path work even when the DB is
    in seed/fallback mode. Locally (no Catalyst) repo.app is None, so tests
    still get the honest HTML fallback.
    """
    if getattr(repo, "app", None) is not None:
        try:
            raw = repo.app.smart_browz().convert_to_pdf(html)
            pdf_bytes = raw.content if hasattr(raw, "content") else bytes(raw)
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}.pdf"',
                    "X-Pramaan-Export-Mode": "smartbrowz_pdf",
                })
        except Exception as e:
            logger.error(f"SmartBrowz PDF conversion failed; returning HTML instead: {e}")
            mode = "fallback_html_smartbrowz_error"
        else:  # pragma: no cover
            mode = "smartbrowz_pdf"
    else:
        mode = "fallback_html_no_smartbrowz"
    return Response(
        content=html,
        media_type="text/html; charset=utf-8",
        headers={"X-Pramaan-Export-Mode": mode})


# ---------------------------------------------------------------------------
# Endpoints (RBAC: own_case_detail via the app-level middleware)
# ---------------------------------------------------------------------------

@router.get("/health")
def health():
    return {"status": "ok", "module": "export_fn"}


@router.post("/conversation_pdf")
def conversation_pdf(req: ConversationExportRequest, request: Request):
    repo = request.state.repo
    rows = repo.fetch_conversation_log(req.session_id)
    if not rows:
        # Fail loudly: an empty history is reported, never padded into a
        # plausible-looking document.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No conversation history found"
                   + (f" for session '{req.session_id}'" if req.session_id else "")
                   + ". ConversationLog rows are written per answered "
                     "intent-router query; run some queries first.")
    role = repo.get_user_role(dict(request.headers))
    html = _conversation_html(rows, role)
    return _render(repo, html, "pramaan-conversation-history")


@router.post("/dossier_pdf")
def dossier_pdf(req: DossierRequest, request: Request):
    repo = request.state.repo
    cases = repo.fetch_cases()
    links = repo.fetch_links()
    persons = repo.fetch_persons()

    target = next((c for c in cases if c.get("case_id") == req.case_id), None)
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{req.case_id}' not found; dossier not generated.")

    # Resolved suspects on the target case -- canonical IDs only, per the
    # schema's non-negotiable rule (nothing downstream references person_id).
    suspect_ids = [l["canonical_id"] for l in links if l["case_id"] == req.case_id]
    suspects = [p for p in persons if p.get("canonical_id") in suspect_ids]

    # Case-twin evidence: same scoring engine the /match endpoint serves,
    # called in-process (no HTTP hop). Kannada narratives stay Kannada.
    def to_model(c, susp):
        return ct.CaseRecordModel(
            case_id=c.get("case_id"),
            crime_type=c.get("crime_type") or "Unknown",
            modus_operandi=c.get("modus_operandi") or "",
            narrative_text=c.get("narrative_text") or "",
            latitude=float(c.get("latitude") or 0.0),
            longitude=float(c.get("longitude") or 0.0),
            date_time=str(c.get("date_time") or ""),
            weapon=c.get("weapon"),
            canonical_suspect_ids=susp,
            narrative_embedding=c.get("narrative_embedding"),
        )

    candidates = []
    for c in cases:
        if c.get("case_id") == req.case_id:
            continue
        c_susp = [l["canonical_id"] for l in links if l["case_id"] == c.get("case_id")]
        candidates.append(to_model(c, c_susp))
    twin_result = {"top_matches": [], "flagged_linkages": []}
    if candidates:
        twin_result = ct.match(
            ct.MatchRequest(target=to_model(target, suspect_ids),
                            candidates=candidates, top_k=req.top_k),
            request)

    communities = gf.communities()          # Leiden clusters (mock without Neo4j)
    hotspots = gf.hotspots(request)         # spatial clusters from live/seed cases
    audit_rows = repo.fetch_audit_logs(50)  # chain-of-access, incl. this request

    role = repo.get_user_role(dict(request.headers))
    html = _dossier_html(role, target, suspects, twin_result,
                         communities, hotspots, audit_rows)
    return _render(repo, html, f"pramaan-dossier-{req.case_id}")
