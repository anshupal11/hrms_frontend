import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarCheck } from 'lucide-react'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees',  icon: Users,           label: 'People'     },
  { to: '/attendance', icon: CalendarCheck,   label: 'Attendance' },
]

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        background: 'white',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Brand */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            {/* Logo: a simple geometric mark */}
            <div style={{
              width: 30, height: 30, flexShrink: 0,
              background: 'var(--green)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Inner geometric detail */}
              <div style={{
                width: 12, height: 12,
                border: '2px solid rgba(255,255,255,0.9)',
                borderRadius: 3,
                transform: 'rotate(12deg)',
              }} />
            </div>
            <div>
              <div style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 15.5,
                color: 'var(--ink)',
                lineHeight: 1,
              }}>
                PeopleDesk
              </div>
              <div style={{
                fontSize: 10.5,
                color: 'var(--ink-4)',
                fontWeight: 500,
                marginTop: 2,
                letterSpacing: '0.02em',
              }}>
                HR Management
              </div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ padding: '10px 10px', flex: 1 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--ink-5)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '4px 10px 8px',
          }}>
            Workspace
          </div>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              style={{ display: 'flex', marginBottom: 2 }}
            >
              <Icon size={14} strokeWidth={2} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '10px 12px 14px', borderTop: '1px solid var(--border-2)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 8,
            background: 'var(--paper)',
            border: '1px solid var(--border-2)',
          }}>
            <div className="av" style={{ width: 26, height: 26, fontSize: 11, background: 'var(--green-3)', color: 'var(--green)', borderColor: 'var(--green-3)' }}>A</div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', lineHeight: 1.2 }}>Admin</div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Full access</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main style={{ flex: 1, minHeight: '100vh', background: 'var(--paper)', overflow: 'auto' }}>
        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(250,249,247,0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border-2)',
          padding: '0 36px',
          height: 44,
          display: 'flex', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: 'var(--ink-4)', fontWeight: 500 }}>
            {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
          </span>
        </div>

        {/* Page content */}
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 36px 64px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
