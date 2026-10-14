import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SmartImage from '../../components/SmartImage/SmartImage'
import { IMG } from '../../data/images'
import { api } from '../../api/client'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function ResetPassword() {
  useDocumentTitle('Choose a new password')
  const { token } = useParams()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const n = {}
    if (form.password.length < 8) n.password = 'Use at least 8 characters.'
    else if (!/\d/.test(form.password)) n.password = 'Add at least one number.'
    if (form.confirm !== form.password) n.confirm = 'The passwords do not match.'
    setErrors(n)
    if (Object.keys(n).length) return
    setBusy(true)
    try { await api.resetPassword(token, form.password); setDone(true) } catch (err) { setErrors({ form: err.message, ...err.fields }) } finally { setBusy(false) }
  }

  return (
    <section className="auth">
      <div className="auth-image"><SmartImage src={IMG.stepwell} alt="Stepwell in Gujarat" ratio="auto" style={{ height: '100%', aspectRatio: 'auto' }} /></div>
      <div className="auth-form">
        <h1>Choose a new password</h1>
        {done ? (
          <>
            <p className="muted">Your password was updated.</p>
            <Link to="/login" className="btn btn-primary btn-block">Go to login</Link>
          </>
        ) : (
          <form onSubmit={submit} noValidate>
            {errors.form && <p className="form-alert" role="alert">{errors.form} <Link to="/forgot-password" className="text-link">Request a new link</Link></p>}
            <div className={`field ${errors.password ? 'has-error' : ''}`}><label htmlFor="password">New password</label><input id="password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />{errors.password && <p className="field-error">{errors.password}</p>}</div>
            <div className={`field ${errors.confirm ? 'has-error' : ''}`}><label htmlFor="confirm">Confirm password</label><input id="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />{errors.confirm && <p className="field-error">{errors.confirm}</p>}</div>
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving...' : 'Update password'}</button>
          </form>
        )}
      </div>
    </section>
  )
}
