import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, CheckCircle2, XCircle, Trash2, ExternalLink, CalendarCheck, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { attendanceAPI, employeeAPI } from '../services/api'
import { PageHead, TableSkeleton, ErrorState, EmptyState, Modal, Confirm, Field, Alert, Spinner } from '../components/UI'

const TODAY = new Date().toISOString().split('T')[0]

export default function Attendance() {
  const [recs, setRecs]       = useState([])
  const [emps, setEmps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [date, setDate]       = useState(TODAY)
  const [sf, setSf]           = useState('')
  const [ef, setEf]           = useState('')
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState({ employee: '', date: TODAY, status: 'Present' })
  const [formErr, setFormErr] = useState('')
  const [busy, setBusy]       = useState(false)
  const [del, setDel]         = useState(null)
  const [delBusy, setDelBusy] = useState(false)

  const loadRecs = async () => {
    setLoading(true); setError(null)
    try {
      const r = await attendanceAPI.list({ date, status: sf, employee_id: ef })
      setRecs(r.data.results)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    employeeAPI.list({ page_size: 200 }).then(r => setEmps(r.data.results)).catch(() => {})
  }, [])

  useEffect(() => { loadRecs() }, [date, sf, ef])

  const openMark = () => { setForm({ employee: '', date: TODAY, status: 'Present' }); setFormErr(''); setModal(true) }

  const handleMark = async e => {
    e.preventDefault(); setBusy(true); setFormErr('')
    try {
      await attendanceAPI.create({ ...form, employee: parseInt(form.employee) })
      toast.success('Attendance marked')
      setModal(false); loadRecs()
    } catch (e) {
      const d = e.data?.errors
      setFormErr(d?.detail || d?.non_field_errors?.[0] || e.message || 'Failed')
    } finally { setBusy(false) }
  }

  const handleDel = async () => {
    setDelBusy(true)
    try { await attendanceAPI.delete(del.id); toast.success('Record removed'); setDel(null); loadRecs() }
    catch { toast.error('Failed to delete') }
    finally { setDelBusy(false) }
  }

  const presentCount = recs.filter(r => r.status === 'Present').length
  const absentCount  = recs.filter(r => r.status === 'Absent').length

  return (
    <div>
      <PageHead title="Attendance" sub="Track daily presence across your team">
        <button className="btn-primary" onClick={openMark} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} strokeWidth={2.5} />
          Mark attendance
        </button>
      </PageHead>

     

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input type="date" className="field" style={{ width: 'auto' }} value={date} onChange={e => setDate(e.target.value)} />
        <select className="field" style={{ width: 'auto', minWidth: 130 }} value={sf} onChange={e => setSf(e.target.value)}>
          <option value="">All status</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
        <select className="field" style={{ width: 'auto', minWidth: 160 }} value={ef} onChange={e => setEf(e.target.value)}>
          <option value="">All employees</option>
          {emps.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
        </select>
        {(sf || ef || date !== TODAY) && (
          <button className="btn-ghost" style={{ fontSize: 12.5 }} onClick={() => { setSf(''); setEf(''); setDate(TODAY) }}>
            Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="surface" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-2)' }}>
              <th className="t-head">Employee</th>
              <th className="t-head">ID</th>
              <th className="t-head">Department</th>
              <th className="t-head">Date</th>
              <th className="t-head">Status</th>
              <th className="t-head" style={{ textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6}><TableSkeleton rows={5} /></td></tr>}
            {!loading && error && <tr><td colSpan={6}><ErrorState message={error} onRetry={loadRecs} /></td></tr>}
            {!loading && !error && recs.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="No records"
                    description={sf || ef || date !== TODAY ? "Try different filters" : "No attendance marked for this date."}
                    action={
                      <button className="btn-primary" onClick={openMark} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Plus size={13} /> Mark attendance
                      </button>
                    }
                  />
                </td>
              </tr>
            )}
            {!loading && !error && recs.map(rec => (
              <tr key={rec.id} className="t-row">
                <td className="t-cell">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div className="av" style={{ width: 28, height: 28, fontSize: 11 }}>
                      {rec.employee_name?.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{rec.employee_name}</span>
                  </div>
                </td>
                <td className="t-cell"><span className="id-chip">{rec.employee_id_code}</span></td>
                <td className="t-cell"><span className="badge-dept">{rec.department}</span></td>
                <td className="t-cell">
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--ink-3)' }}>{rec.date}</span>
                </td>
                <td className="t-cell">
                  {rec.status === 'Present'
                    ? <span className="badge-present"><CheckCircle2 size={10} /> Present</span>
                    : <span className="badge-absent"><XCircle size={10} /> Absent</span>
                  }
                </td>
                <td className="t-cell" style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                    <Link to={`/employees/${rec.employee}`} className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '4px 8px' }}>
                      <ExternalLink size={11} />
                    </Link>
                    <button className="btn-danger" style={{ padding: '4px 8px' }} onClick={() => setDel(rec)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mark modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Mark attendance">
        <form onSubmit={handleMark} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Alert message={formErr} />
          <Field label="Employee">
            <select className="field" value={form.employee} onChange={e => setForm({...form, employee: e.target.value})} required>
              <option value="">Select an employee…</option>
              {emps.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name} — {emp.employee_id}</option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input className="field" type="date" value={form.date} max={TODAY} onChange={e => setForm({...form, date: e.target.value})} required />
          </Field>
          <Field label="Status">
            <div style={{ display: 'flex', gap: 8 }}>
              {['Present', 'Absent'].map(s => (
                <button
                  type="button" key={s}
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
              Save
            </button>
          </div>
        </form>
      </Modal>

      <Confirm
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={handleDel}
        title="Delete record?"
        body={`Remove attendance for ${del?.employee_name} on ${del?.date}?`}
        busy={delBusy}
      />
    </div>
  )
}

function SummaryPill({ value, label, color, bg, border }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '5px 12px', borderRadius: 8,
      background: bg || 'white', border: `1px solid ${border || 'var(--border)'}`,
      fontSize: 13,
    }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: color || 'var(--ink-2)' }}>{value}</span>
      <span style={{ color: 'var(--ink-4)', fontWeight: 500 }}>{label}</span>
    </div>
  )
}
