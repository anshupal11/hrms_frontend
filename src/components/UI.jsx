import { AlertTriangle, Inbox, RotateCcw, Loader2 } from 'lucide-react'

/* ─── Loading spinner ─────────────────────────────────────────────────── */
export function Spinner({ size = 18 }) {
  return <Loader2 size={size} style={{ animation: 'spin 0.75s linear infinite', color: 'var(--green)' }} />
}

/* Tailwind doesn't give us the spin keyframe inline, add it via CSS */
const spinStyle = document.createElement('style')
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
document.head.appendChild(spinStyle)

/* ─── Table skeleton ──────────────────────────────────────────────────── */
export function TableSkeleton({ rows = 6 }) {
  return (
    <div style={{ padding: '8px 0' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', alignItems: 'center', borderBottom: '1px solid var(--border-2)' }}>
          <div className="skel" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
          <div className="skel" style={{ width: 80 + (i % 3) * 20, height: 12 }} />
          <div className="skel" style={{ flex: 1, height: 12 }} />
          <div className="skel" style={{ width: 72, height: 12 }} />
          <div className="skel" style={{ width: 55, height: 20, borderRadius: 99 }} />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="surface" style={{ padding: 20 }}>
          <div className="skel" style={{ width: 32, height: 32, borderRadius: 8, marginBottom: 16 }} />
          <div className="skel" style={{ width: '50%', height: 28, marginBottom: 8 }} />
          <div className="skel" style={{ width: '70%', height: 11 }} />
        </div>
      ))}
    </div>
  )
}

/* ─── Error state ─────────────────────────────────────────────────────── */
export function ErrorState({ message, onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'var(--red-bg)', border: '1px solid var(--red-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <AlertTriangle size={20} color="var(--red)" strokeWidth={1.8} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 17, color: 'var(--ink)', marginBottom: 4 }}>Something went wrong</p>
        <p style={{ fontSize: 13, color: 'var(--ink-4)', maxWidth: 320 }}>{typeof message === 'string' ? message : 'Failed to load data'}</p>
      </div>
      {onRetry && (
        <button className="btn-secondary" onClick={onRetry} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RotateCcw size={13} /> Try again
        </button>
      )}
    </div>
  )
}

/* ─── Empty state ─────────────────────────────────────────────────────── */
export function EmptyState({ title, description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '52px 24px', gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: 'var(--paper-2)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Inbox size={18} color="var(--ink-5)" strokeWidth={1.8} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>{title}</p>
        {description && <p style={{ fontSize: 13, color: 'var(--ink-4)', maxWidth: 280 }}>{description}</p>}
      </div>
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  )
}

/* ─── Modal ───────────────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-mask" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ padding: '18px 20px 16px', borderBottom: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: 'var(--ink)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '4px 6px', fontSize: 16, lineHeight: 1, color: 'var(--ink-4)' }}
          >×</button>
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  )
}

/* ─── Confirm dialog ──────────────────────────────────────────────────── */
export function Confirm({ open, onClose, onConfirm, title, body, busy }) {
  if (!open) return null
  return (
    <div className="modal-mask">
      <div className="modal-box" style={{ maxWidth: 380 }}>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: 'var(--red-bg)', border: '1px solid var(--red-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={17} color="var(--red)" />
            </div>
            <div>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: 'var(--ink)', marginBottom: 3 }}>{title}</p>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>{body}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={onClose} disabled={busy} style={{ fontSize: 13, padding: '6px 14px' }}>Cancel</button>
            <button
              onClick={onConfirm}
              disabled={busy}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                background: 'var(--red)', color: 'white', border: 'none', cursor: 'pointer',
                opacity: busy ? 0.5 : 1,
                fontFamily: "'Instrument Sans', sans-serif",
              }}
            >
              {busy && <Spinner size={13} />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Form field wrapper ──────────────────────────────────────────────── */
export function Field({ label, error, children }) {
  return (
    <div>
      {label && <label className="field-label">{label}</label>}
      {children}
      {error && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 5 }}>{error}</p>}
    </div>
  )
}

/* ─── Page heading ────────────────────────────────────────────────────── */
export function PageHead({ title, sub, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
      <div>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: 'var(--ink)', marginBottom: sub ? 2 : 0 }}>{title}</h1>
        {sub && <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>{sub}</p>}
      </div>
      {children && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{children}</div>}
    </div>
  )
}

/* ─── Inline alert ────────────────────────────────────────────────────── */
export function Alert({ message }) {
  if (!message) return null
  return (
    <div style={{
      background: 'var(--red-bg)', border: '1px solid var(--red-border)',
      borderRadius: 8, padding: '10px 14px',
      fontSize: 13, color: 'var(--red)', lineHeight: 1.4,
    }}>{message}</div>
  )
}
