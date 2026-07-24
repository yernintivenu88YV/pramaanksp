/**
 * Role-based access model for the UI.
 *
 * This mirrors the backend's default-deny RBAC (appsail/routers/gateway_fn.py)
 * exactly, so the interface tells the same truth the API enforces. The server
 * remains the authority — the UI never becomes the security boundary, it just
 * stops lower-privileged users from walking into a guaranteed 403 and makes the
 * governance boundary visible instead of surprising.
 */

export const ROLES = ['SI', 'ACP', 'Analyst', 'Policy'];

export const ROLE_LABELS = {
  SI: 'Sub-Inspector',
  ACP: 'Asst. Commissioner',
  Analyst: 'Crime Analyst',
  Policy: 'Policy Maker',
};

/** Must stay in sync with PERMISSIONS in appsail/routers/gateway_fn.py */
export const PERMISSIONS = {
  SI: ['own_case_detail', 'aggregate_analytics'],
  ACP: ['own_case_detail', 'aggregate_analytics', 'case_reassignment', 'district_rollup'],
  Analyst: ['aggregate_analytics', 'district_rollup'],
  Policy: ['district_rollup', 'state_rollup'],
};

const AGGREGATE = ['aggregate_analytics', 'district_rollup', 'state_rollup'];

/**
 * Each view declares which permissions grant access (any-of).
 * Case-level views require `own_case_detail` — the permission that separates
 * investigators (SI/ACP) from analysts and policy makers.
 */
export const VIEW_ACCESS = {
  overview:   { any: AGGREGATE,             label: 'Command Overview' },
  alerts:     { any: AGGREGATE,             label: 'Alert Stream' },
  map:        { any: AGGREGATE,             label: 'Live Crime Map' },
  audit:      { any: AGGREGATE,             label: 'Audit & Compliance' },
  cases:      { any: ['own_case_detail'],   label: 'Case Register' },
  resolution: { any: ['own_case_detail'],   label: 'Identity Resolution' },
  similar:    { any: ['own_case_detail'],   label: 'Case Twins' },
  graph:      { any: ['own_case_detail'],   label: 'Entity Graph' },
  assistant:  { any: ['own_case_detail'],   label: 'AI Assistant' },
  helpdesk:   { any: AGGREGATE,             label: 'Public Help Desk' },
};

export function permissionsFor(role) {
  return PERMISSIONS[role] || [];
}

export function hasPermission(role, permission) {
  return permissionsFor(role).includes(permission);
}

/** Can `role` open `viewKey`? */
export function canAccessView(role, viewKey) {
  const rule = VIEW_ACCESS[viewKey];
  if (!rule) return true;
  const held = permissionsFor(role);
  return rule.any.some((p) => held.includes(p));
}

/** The permission a user would need to open this view (for the denial message). */
export function requiredPermissionFor(viewKey) {
  const rule = VIEW_ACCESS[viewKey];
  return rule ? rule.any[0] : null;
}

/** Roles that would be allowed — shown so the denial is actionable. */
export function rolesAllowedFor(viewKey) {
  return ROLES.filter((r) => canAccessView(r, viewKey));
}

/** First view this role may open — used to redirect away from a locked view. */
export function firstAllowedView(role, preferred = 'overview') {
  if (canAccessView(role, preferred)) return preferred;
  return Object.keys(VIEW_ACCESS).find((v) => canAccessView(role, v)) || 'overview';
}
