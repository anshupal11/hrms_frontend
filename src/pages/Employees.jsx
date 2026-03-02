import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Trash2, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { employeeAPI } from '../services/api'
import { PageHead, TableSkeleton, ErrorState, EmptyState, Modal, Confirm, Field, Alert, Spinner } from '../components/UI'

const DEPTS = ['Engineering','Product','Design','Marketing','Sales','HR','Finance','Operations','Legal','Other']
const BLANK = { employee_id: '', full_name: '', email: '', department: '' }

export default function Employees() {
  const [rows, setRows]         = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [dept, setDept]         = useState('')
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(BLANK)
  const [errs, setErrs]         = useState({})
  const [busy, setBusy]         = useState(false)
  const [confirm, setConfirm]   = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const r = await employeeAPI.list({ search, department: dept })
      setRows(r.data.results); setTotal(r.data.count)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [search, dept])

  useEffect(() => {
    const t = setTimeout(load, search ? 280 : 0)
    return () => clearTimeout(t)
  }, [load])

  const openAdd = () => { setForm(BLANK); setErrs({}); setModal(true) }

  const handleAdd = async e => {
    e.preventDefault(); setBusy(true); setErrs({})
    try {
      await employeeAPI.create(form)
      toast.success('Employee added')
      setModal(false); load()
    } catch (e) {
      if (e.data?.errors) {
        const flat = {}
        Object.entries(e.data.errors).forEach(([k, v]) => flat[k] = Array.isArray(v) ? v[0] : v)
        setErrs(flat)
      } else toast.error('Failed to add employee')
    } finally { setBusy(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await employeeAPI.delete(confirm.id)
      toast.success(`${confirm.full_name} removed`)
      setConfirm(null); load()
    } catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  return (
    <div>
      <PageHead title="People" sub={total > 0 ? `${total} employee${total !== 1 ? 's' : ''}` : undefined}>
        <button className="btn-primary" onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} strokeWidth={2.5} />
          Add employee
        </button>
      </PageHead>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 360 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-5)', pointerEvents: 'none' }} />
          <input
            className="field"
            style={{ paddingLeft: 32 }}
            placeholder="Search name, ID, or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
      </div>

      {/* Table */}
      <div className="surface" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-2)' }}>
              <th className="t-head">Employee</th>
              <th className="t-head">ID</th>
              <th className="t-head">Email</th>
              <th className="t-head">Department</th>
              <th className="t-head">Attendance</th>
              <th className="t-head" style={{ textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6}><TableSkeleton rows={5} /></td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan={6}><ErrorState message={error} onRetry={load} /></td></tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title={search || dept ? 'No results' : 'No employees yet'}
                    description={search || dept ? 'Try a different search' : 'Add your first employee to get started.'}
                    action={!search && !dept && (
                      <button className="btn-primary" onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Plus size={13} /> Add employee
                      </button>
                    )}
                  />
                </td>
              </tr>
            )}
            {!loading && !error && rows.map(emp => (
              <tr key={emp.id} className="t-row">
                <td className="t-cell">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="av" style={{ width: 30, height: 30, fontSize: 12 }}>
                      {emp.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{emp.full_name}</span>
                  </div>
                </td>
                <td className="t-cell"><span className="id-chip">{emp.employee_id}</span></td>
                <td className="t-cell" style={{ color: 'var(--ink-3)', fontSize: 13 }}>{emp.email}</td>
                <td className="t-cell"><span className="badge-dept">{emp.department}</span></td>
                <td className="t-cell">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500, color: 'var(--green)' }}>
                      {emp.total_present_days}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--ink-5)' }}>/ {emp.total_attendance_days} days</span>
                  </div>
                </td>
                <td className="t-cell" style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Link
                      to={`/employees/${emp.id}`}
                      className="btn-ghost"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, padding: '5px 9px' }}
                    >
                      View <ArrowRight size={11} />
                    </Link>
                    <button
                      className="btn-danger"
                      onClick={() => setConfirm(emp)}
                      style={{ padding: '5px 9px' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add employee">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Employee ID" error={errs.employee_id}>
              <input className="field" placeholder="EMP-001" value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} required />
            </Field>
            <Field label="Department" error={errs.department}>
              <select className="field" value={form.department} onChange={e => setForm({...form, department: e.target.value})} required>
                <option value="">Select…</option>
                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Full name" error={errs.full_name}>
            <input className="field" placeholder="Jane Smith" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
          </Field>
          <Field label="Work email" error={errs.email}>
            <input className="field" type="email" placeholder="jane@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </Field>
          <Alert message={errs.non_field_errors || errs.detail} />
          <div style={{ display: 'flex', gap: 8, paddingTop: 4, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => setModal(false)} disabled={busy}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {busy ? <Spinner size={13} /> : <Plus size={13} />}
              Add employee
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Confirm
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        title="Remove employee?"
        body={`This will permanently delete ${confirm?.full_name} and all their attendance records. This cannot be undone.`}
        busy={deleting}
      />
    </div>
  )
}
