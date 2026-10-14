import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SmartImage from '../../components/SmartImage/SmartImage'
import { IMG } from '../../data/images'
import { villages } from '../../data'
import { DISTRICTS } from '../../data/categories'
import { useApp } from '../../context/AppContext'
import useDocumentTitle from '../../hooks/useDocumentTitle'

function F({ id, label, error, children }) {
  return <div className={`field ${error ? 'has-error' : ''}`}><label htmlFor={id}>{label}</label>{children}{error && <p className="field-error">{error}</p>}</div>
}

export default function Register() {
  useDocumentTitle('Create account')
  const { register } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', village: '', district: '', accept: false })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })) }

  const submit = async (e) => {
    e.preventDefault()
    const n = {}
    if (form.name.trim().length < 3) n.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) n.email = 'Enter a valid email address.'
    if (form.password.length < 8) n.password = 'Use at least 8 characters.'
    else if (!/\d/.test(form.password)) n.password = 'Add at least one number.'
    if (form.confirm !== form.password) n.confirm = 'The passwords do not match.'
    if (!form.village) n.village = 'Choose your village.'
    if (!form.district) n.district = 'Choose your district.'
    if (!form.accept) n.accept = 'Please accept the Terms and Privacy Policy to continue.'
    setErrors(n)
    if (Object.keys(n).length) return
    setBusy(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password, village: form.village, district: form.district, acceptTerms: true })
      navigate('/profile')
    } catch (err) {
      setErrors({ form: err.message, ...err.fields })
    } finally { setBusy(false) }
  }

  return (
    <section className="auth">
      <div className="auth-image"><SmartImage src={IMG.stepwell} alt="Stepwell in Gujarat" ratio="auto" style={{ height: '100%', aspectRatio: 'auto' }} /></div>
      <div className="auth-form">
        <h1>Create your account</h1>
        <p className="muted">Join your village’s heritage record. It takes a minute.</p>
        <form onSubmit={submit} noValidate>
          {errors.form && <p className="form-alert" role="alert">{errors.form}</p>}
          <F id="name" error={errors.name} label="Full name"><input id="name" type="text" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} /></F>
          <F id="email" error={errors.email} label="Email"><input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></F>
          <div className="field-row">
            <F id="password" error={errors.password} label="Password"><input id="password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => set('password', e.target.value)} /></F>
            <F id="confirm" error={errors.confirm} label="Confirm password"><input id="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} /></F>
          </div>
          <div className="field-row">
            <F id="village" error={errors.village} label="Village"><select id="village" value={form.village} onChange={(e) => set('village', e.target.value)}><option value="">Select</option>{villages.map((v) => <option key={v.id}>{v.name}</option>)}</select></F>
            <F id="district" error={errors.district} label="District"><select id="district" value={form.district} onChange={(e) => set('district', e.target.value)}><option value="">Select</option>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></F>
          </div>
          <div className={`field ${errors.accept || errors.acceptTerms ? 'has-error' : ''}`}>
            <label className="check"><input type="checkbox" checked={form.accept} onChange={(e) => set('accept', e.target.checked)} /> <span>I agree to the <Link to="/terms" className="text-link">Terms of Use</Link> and <Link to="/privacy" className="text-link">Privacy Policy</Link>.</span></label>
            {(errors.accept || errors.acceptTerms) && <p className="field-error">{errors.accept || errors.acceptTerms}</p>}
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="auth-foot">Already registered? <Link to="/login" className="text-link">Login</Link></p>
      </div>
    </section>
  )
}
