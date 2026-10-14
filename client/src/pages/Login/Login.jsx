import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SmartImage from '../../components/SmartImage/SmartImage'
import { IMG } from '../../data/images'
import { useApp } from '../../context/AppContext'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function Login() {
  useDocumentTitle('Login')
  const { login, googleLogin } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address, like name@example.com.'
    if (!form.password) next.password = 'Enter your password.'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    try {
      const profile = await login({ email: form.email, password: form.password })
      navigate(profile.role === 'admin' ? '/admin' : '/profile')   // decided by the account's role, not the email text
    } catch (err) {
      setErrors({ form: err.message, ...err.fields })
    } finally { setBusy(false) }
  }
  const google = async () => {
    try { await googleLogin(); navigate('/profile') } catch (err) { setErrors({ form: err.message }) }
  }

  return (
    <section className="auth">
      <div className="auth-image"><SmartImage src={IMG.village} alt="Village lane in Gujarat" ratio="auto" style={{ height: '100%', aspectRatio: 'auto' }} /></div>
      <div className="auth-form">
        <h1>Welcome back</h1>
        <p className="muted">Log in to save heritage, track your contributions and join the discussion.</p>
        <form onSubmit={submit} noValidate>
          {errors.form && <p className="form-alert" role="alert">{errors.form}</p>}
          <div className={`field ${errors.email ? 'has-error' : ''}`}><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={!!errors.email} />{errors.email && <p className="field-error">{errors.email}</p>}</div>
          <div className={`field ${errors.password ? 'has-error' : ''}`}><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} aria-invalid={!!errors.password} />{errors.password && <p className="field-error">{errors.password}</p>}</div>
          <div className="row-between auth-links"><span /><Link to="/forgot-password" className="text-link">Forgot password?</Link></div>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="or"><span>or</span></div>
        <button type="button" className="btn btn-secondary btn-block" onClick={google}>Continue with Google</button>
        <p className="auth-foot">New to VirasatVault? <Link to="/register" className="text-link">Create account</Link></p>
        <p className="meta demo-hint">Demo accounts: ramesh@example.com / Member@123 (contributor) and admin@heritagehub.demo / Admin@123 (reviewer). “Continue with Google” signs in a demo account.</p>
      </div>
    </section>
  )
}
