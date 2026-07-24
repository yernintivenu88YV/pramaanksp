import { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, UserCheck, ShieldAlert, Check } from 'lucide-react';
import { ROLE_LABELS, requiredPermissionFor, rolesAllowedFor, VIEW_ACCESS } from '../../access';
import { type } from '../../design/scale';

/**
 * Shown when the active role lacks the permission a view requires.
 * Provides explicit, actionable recovery buttons ("Switch to a role with access",
 * "Request ACP Clearance Override") rather than passive messages.
 */
export function RestrictedView({ viewKey, activeRole, onRoleChange, onOpenLoginModal }) {
  const label = VIEW_ACCESS[viewKey]?.label || 'This module';
  const required = requiredPermissionFor(viewKey);
  const allowed = rolesAllowedFor(viewKey);
  const [requested, setRequested] = useState(false);

  const primaryRoleTarget = allowed[0] || 'ACP';

  function handleSwitchRole() {
    if (onRoleChange && allowed.length > 0) {
      onRoleChange(primaryRoleTarget);
    } else if (onOpenLoginModal) {
      onOpenLoginModal();
    }
  }

  function handleRequestOverride() {
    setRequested(true);
    setTimeout(() => setRequested(false), 4000);
  }

  return (
    <div className="flex min-h-[420px] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-pramaan-border bg-pramaan-surface p-6 text-center shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
          <Lock size={20} strokeWidth={1.9} />
        </div>

        <h2 className="mt-4 text-pramaan-text" style={type.subheading}>
          {label} is restricted
        </h2>

        <p className="mt-2 text-pramaan-text-secondary" style={type.body}>
          Your active role{' '}
          <span className="rounded bg-pramaan-elevated px-1.5 py-0.5 font-mono text-pramaan-text">
            {activeRole}
          </span>{' '}
          ({ROLE_LABELS[activeRole] || 'unknown'}) does not hold the permission
          this module requires.
        </p>

        <div className="mt-4 rounded-lg border border-pramaan-border bg-pramaan-elevated/60 p-3 text-left">
          <div className="text-pramaan-text-secondary" style={type.micro}>REQUIRED PERMISSION</div>
          <div className="mt-1 font-mono text-pramaan-primary" style={type.label}>{required}</div>

          <div className="mt-3 text-pramaan-text-secondary" style={type.micro}>ROLES WITH ACCESS</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {allowed.map((r) => (
              <span
                key={r}
                className="rounded border border-pramaan-border bg-pramaan-surface px-1.5 py-0.5 font-mono text-pramaan-text"
                style={type.micro}
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Actionable Recovery Actions */}
        <div className="mt-5 space-y-2">
          <button
            onClick={handleSwitchRole}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-pramaan-primary px-4 py-2.5 text-xs font-bold text-pramaan-bg transition-colors hover:bg-pramaan-secondary"
          >
            <UserCheck size={14} />
            Switch to {primaryRoleTarget} Role
            <ArrowRight size={14} />
          </button>

          <button
            onClick={handleRequestOverride}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-pramaan-border bg-pramaan-elevated px-4 py-2 text-xs font-semibold text-pramaan-text hover:border-pramaan-border-strong hover:bg-pramaan-surface transition-colors"
          >
            {requested ? <Check size={14} className="text-pramaan-success" /> : <ShieldAlert size={14} className="text-pramaan-warning" />}
            {requested ? 'Clearance Request Sent to Station ACP' : `Contact ACP for ${required} Permission`}
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-pramaan-border/70 bg-pramaan-elevated/40 p-3 text-left">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-pramaan-primary" strokeWidth={1.8} />
          <p className="text-pramaan-text-secondary" style={type.micro}>
            Enforced server-side by default-deny RBAC — the API returns 403 for
            this role regardless of the interface. This access attempt is
            recorded in <span className="font-mono text-pramaan-text">AccessAuditLog</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
