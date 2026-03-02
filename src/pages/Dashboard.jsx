import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, CalendarCheck, CheckCircle2, XCircle, ArrowUpRight, Clock } from 'lucide-react'
import { dashboardAPI } from '../services/api'
import { CardSkeleton, ErrorState } from '../components/UI'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true); setError(null)
    try { const r = await dashboardAPI.summary(); setData(r.data) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const rate = data?.today?.marked > 0
    ? Math.round((data.today.present / data.today.marked) * 100)
    : null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      {/* Page heading — feels like a real product */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: 'var(--ink)', fontWeight: 400 }}>
          {greeting}
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--ink-4)', marginTop: 3 }}>
          Here's what's happening with your team today.
        </p>
      </div>

      {loading && <CardSkeleton count={4} />}
      {error && <ErrorState message={error} onRetry={load} />}

      {data && !loading && (
        <div className="anim-in">

          {/* Stat row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }} className="stagger">
            <Stat
              value={data.total_employees}
              label="Total employees"
              icon={<Users size={14} strokeWidth={2} color="var(--ink-3)" />}
              href="/employees"
            />
            <Stat
              value={data.today.present}
              label="Present today"
              sub={data.today.marked > 0 ? `of ${data.today.marked} marked` : 'no records yet'}
              icon={<CheckCircle2 size={14} strokeWidth={2} color="var(--green)" />}
              accent="var(--green)"
            />
            <Stat
              value={data.today.absent}
              label="Absent today"
              sub={data.today.not_marked > 0 ? `${data.today.not_marked} not marked` : 'all marked'}
              icon={<XCircle size={14} strokeWidth={2} color="var(--red)" />}
              accent="var(--red)"
            />
            <Stat
              value={rate !== null ? `${rate}%` : '—'}
              label="Attendance rate"
              sub="today"
              icon={<Clock size={14} strokeWidth={2} color="var(--ink-3)" />}
            />
          </div>

          {/* Content row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>

            {/* Department headcount */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>Headcount by department</span>
                <Link to="/employees" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--green)', textDecoration: 'none', fontWeight: 500 }}>
                  All people <ArrowUpRight size={11} />
                </Link>
              </div>

              {data.departments.length === 0 ? (
                <div style={{ padding: '32px 18px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>No employees yet.</p>
                  <Link to="/employees" style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500, textDecoration: 'none', marginTop: 6, display: 'inline-block' }}>Add your first →</Link>
                </div>
              ) : (
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[...data.departments].sort((a, b) => b.count - a.count).map((dept, i) => {
                    const pct = data.total_employees > 0 ? (dept.count / data.total_employees) * 100 : 0
                    return (
                      <div key={dept.department}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                          <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{dept.department}</span>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--ink-4)' }}>
                            {dept.count}
                            <span style={{ color: 'var(--ink-5)' }}> / {data.total_employees}</span>
                          </span>
                        </div>
                        <div className="progress">
                          <div className="progress-fill" style={{ width: `${pct}%`, transitionDelay: `${i * 60}ms` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* All-time totals */}
              

              {/* Quick actions */}
              <div className="surface" style={{ padding: '16px 18px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Quick actions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <QuickLink to="/employees" label="Add new employee" icon="→" />
                  <QuickLink to="/attendance" label="Mark attendance" icon="→" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ value, label, sub, icon, href, accent }) {
  const inner = (
    <div className="surface" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: 'var(--paper-2)', border: '1px solid var(--border-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        {href && <ArrowUpRight size={13} color="var(--ink-5)" />}
      </div>
      <div style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: 30, color: accent || 'var(--ink)',
        lineHeight: 1, marginBottom: 5,
      }}>{value}</div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-5)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
  if (href) return <Link to={href} style={{ textDecoration: 'none' }}>{inner}</Link>
  return inner
}

function Row({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{label}</span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: valueColor || 'var(--ink-2)' }}>{value}</span>
    </div>
  )
}

function QuickLink({ to, label }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 11px', borderRadius: 7, textDecoration: 'none',
        background: 'var(--paper)', border: '1px solid var(--border-2)',
        fontSize: 13, color: 'var(--ink-2)', fontWeight: 500,
        transition: 'all 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-bg)'; e.currentTarget.style.borderColor = 'var(--green-3)'; e.currentTarget.style.color = 'var(--green)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--paper)'; e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
    >
      {label}
      <ArrowUpRight size={13} />
    </Link>
  )
}
