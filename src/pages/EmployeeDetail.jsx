import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CalendarCheck, CheckCircle2, XCircle, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { employeeAPI, attendanceAPI } from '../services/api'
import {  ErrorState, EmptyState, Modal, Confirm, Field, Alert, Spinner } from '../components/UI'

const TODAY = new Date().toISOString().split('T')[0]

// Inline loading since LoadingState might not exist yet
function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 28, height: 28, border: '2.5px solid var(--border)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>Loading…</p>
      </div>
    </div>
  )
}

export default function EmployeeDetail() {
  const { id } = useParams()
  const [emp, setEmp]         = useState(null)
  const [recs, setRecs]       = useState([])
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [df, setDf]           = useState('')
  const [dt, setDt]           = useState('')
  const [sf, setSf]           = useState('')
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState({ date: TODAY, status: 'Present' })
  const [formErr, setFormErr] = useState('')
  const [busy, setBusy]       = useState(false)
  const [del, setDel]         = useState(null)
  const [delBusy, setDelBusy] = useState(false)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const r = await employeeAPI.getAttendance(id, { date_from: df, date_to: dt, status: sf })
      setEmp(r.data.employee)
      setRecs(r.data.records)
      setStats({ present: r.data.present_count, absent: r.data.absent_count, total: r.data.count })
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id, df, dt, sf])

  const handleMark = async e => {
    e.preventDefault(); setBusy(true); setFormErr('')
    try {
      await attendanceAPI.create({ employee: parseInt(id), ...form })
      toast.success('Attendance recorded')
      setModal(false); load()
    } catch (e) {
      const d = e.data?.errors
      setFormErr(d?.detail || d?.non_field_errors?.[0] || e.message || 'Failed')
    } finally { setBusy(false) }
  }

  const handleDel = async () => {
    setDelBusy(true)
    try { await attendanceAPI.delete(del.id); toast.success('Record deleted'); setDel(null); load() }
    catch { toast.error('Failed to delete') }
    finally { setDelBusy(false) }
  }

  if (loading && !emp) return (
    <div>
      <Link to="/employees" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 24, fontSize: 13 }}>
        <ArrowLeft size={13} /> Back
      </Link>
      <Loading />
    </div>
  )
  if (error && !emp) return (
    <div>
      <Link to="/employees" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 24, fontSize: 13 }}>
        <ArrowLeft size={13} /> Back
      </Link>
      <ErrorState message={error} onRetry={load} />
    </div>
  )

  const rate = emp?.total_attendance_days > 0
    ? Math.round((emp.total_present_days / emp.total_attendance_days) * 100)
    : null

  return (
    <div className="anim-in">
      <Link to="/employees" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 20, fontSize: 13, padding: '5px 8px' }}>
        <ArrowLeft size={13} /> People
      </Link>

      {emp && (
        <>
          {/* Employee header card */}
          <div className="surface" style={{ padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              {/* Profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="av" style={{ width: 48, height: 48, fontSize: 18, background: 'var(--green-bg)', color: 'var(--green)', borderColor: 'var(--green-3)' }}>
                  {emp.full_name.charAt(0)}
                </div>
                <div>
                  <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: 'var(--ink)', fontWeight: 400 }}>{emp.full_name}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                    <span className="id-chip">{emp.employee_id}</span>
                    <span className="badge-dept">{emp.department}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>{emp.email}</span>
                  </div>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={() => { setForm({ date: TODAY, status: 'Present' }); setFormErr(''); setModal(true) }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <CalendarCheck size={13} />
                Mark attendance
              </button>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-2)' }}>
              <StatPill label="Days present" value={emp.total_present_days} valueColor="var(--green)" />
              <StatPill label="Days absent" value={emp.total_attendance_days - emp.total_present_days} valueColor="var(--red)" center />
              <StatPill label="Attendance rate" value={rate !== null ? `${rate}%` : '—'} right />
            </div>
          </div>

          {/* Attendance records */}
          <div className="surface" style={{ overflow: 'hidden' }}>
            {/* Table header + filters */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', flex: 1 }}>
                Attendance log
                {recs.length > 0 && <span style={{ fontWeight: 400, color: 'var(--ink-4)', marginLeft: 6 }}>({recs.length})</span>}
              </span>
              <input type="date" className="field" style={{ width: 'auto', fontSize: 12.5 }} value={df} onChange={e => setDf(e.target.value)} />
              <input type="date" className="field" style={{ width: 'auto', fontSize: 12.5 }} value={dt} onChange={e => setDt(e.target.value)} />
              <select className="field" style={{ width: 'auto', fontSize: 12.5 }} value={sf} onChange={e => setSf(e.target.value)}>
                <option value="">All</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
              {(df || dt || sf) && (
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { setDf(''); setDt(''); setSf('') }}>Clear</button>
              )}
            </div>

            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ width: 22, height: 22, border: '2px solid var(--border)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              </div>
            ) : recs.length === 0 ? (
              <EmptyState
                title="No records"
                description={df || dt || sf ? "Try adjusting your filters" : "No attendance marked yet for this employee."}
                action={!df && !dt && !sf && (
                  <button className="btn-primary" onClick={() => setModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={13} /> Mark attendance
                  </button>
                )}
              />
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-2)' }}>
                    <th className="t-head">Date</th>
                    <th className="t-head">Day</th>
                    <th className="t-head">Status</th>
                    <th className="t-head" style={{ textAlign: 'right' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {recs.map(rec => {
                    const d = new Date(rec.date + 'T12:00:00')
                    return (
                      <tr key={rec.id} className="t-row">
                        <td className="t-cell">
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: 'var(--ink-2)' }}>{rec.date}</span>
                        </td>
                        <td className="t-cell" style={{ color: 'var(--ink-4)', fontSize: 13 }}>
                          {d.toLocaleDateString('en-US', { weekday: 'long' })}
                        </td>
                        <td className="t-cell">
                          {rec.status === 'Present'
                            ? <span className="badge-present"><CheckCircle2 size={10} /> Present</span>
                            : <span className="badge-absent"><XCircle size={10} /> Absent</span>
                          }
                        </td>
                        <td className="t-cell" style={{ textAlign: 'right' }}>
                          <button className="btn-danger" style={{ padding: '4px 8px' }} onClick={() => setDel(rec)}>
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                {recs.length > 0 && (
                  <tfoot>
                    <tr style={{ background: 'var(--paper)', borderTop: '1px solid var(--border-2)' }}>
                      <td colSpan={2} style={{ padding: '9px 16px', fontSize: 12, color: 'var(--ink-5)' }}>
                        {recs.length} record{recs.length !== 1 ? 's' : ''}
                      </td>
                      <td colSpan={2} style={{ padding: '9px 16px', textAlign: 'right', fontSize: 12 }}>
                        <span style={{ color: 'var(--green)', fontWeight: 600 }}>{stats?.present} present</span>
                        <span style={{ color: 'var(--ink-5)', margin: '0 6px' }}>·</span>
                        <span style={{ color: 'var(--red)', fontWeight: 600 }}>{stats?.absent} absent</span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            )}
          </div>
        </>
      )}

      {/* Mark attendance modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Mark attendance">
        <form onSubmit={handleMark} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Alert message={formErr} />
          <Field label="Date">
            <input className="field" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} max={TODAY} required />
          </Field>
          <Field label="Status">
            <div style={{ display: 'flex', gap: 8 }}>
              {['Present', 'Absent'].map(s => (
                <button
                  type="button"
                  key={s}
                  className={`status-btn ${form.status === s ? (s === 'Present' ? 'active-present' : 'active-absent') : ''}`}
                  onClick={() => setForm({...form, status: s})}
                >
                  {s === 'Present' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" className="btn-secondary" onClick={() => setModal(false)} disabled={busy}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {busy ? <Spinner size={13} /> : <CalendarCheck size={13} />}
              Save record
            </button>
          </div>
        </form>
      </Modal>

      <Confirm
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={handleDel}
        title="Delete record?"
        body={`Remove the attendance record for ${del?.date}?`}
        busy={delBusy}
      />
    </div>
  )
}

function StatPill({ label, value, valueColor, center, right }) {
  return (
    <div style={{ textAlign: center ? 'center' : right ? 'right' : 'left', padding: '0 4px' }}>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: valueColor || 'var(--ink)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}
