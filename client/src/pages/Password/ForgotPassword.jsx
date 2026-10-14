import { useState } from 'react'
import { Link } from 'react-router-dom'
import SmartImage from '../../components/SmartImage/SmartImage'
import { IMG } from '../../data/images'
import { api } from '../../api/client'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function ForgotPassword() {
  useDocumentTitle('Forgot password')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email address.'); return }
    setBusy(true); setError('')
    try { setResult(await api.forgotPassword(email)) } catch (err) { setError(err.fields?.email ?? err.message) } finally { setBusy(false) }
  }

  return (
    <section className="auth">
      <div className="auth-image"><SmartImage src={IMG.village} alt="Village lane in Gujarat" ratio="auto" style={{ height: '100%', aspectRatio: 'auto' }} /></div>
      <div className="auth-form">
        <h1>Reset your password</h1>
        {result ? (
          <>
            <p className="muted">{result.message}</p>
            {result.devLink ? (
              <p className="demo-hint">Demo mode: email is not connected, so the link is shown here. <br /><Link className="text-link" to={new URL(result.devLink).pathname}>Open the reset page</Link></p>
            ) : <p className="muted">Check your email for the link.</p>}
            <p className="auth-foot"><Link to="/login" className="text-link">Back to login</Link></p>
          </>
        ) : (
          <>
            <p className="muted">Enter the email you registered with. We will create a link that lets you choose a new password.</p>
            <form onSubmit={submit} noValidate>
              <div className={`field ${error ? 'has-error' : ''}`}><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />{error && <p className="field-error">{error}</p>}</div>
              <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Please wait...' : 'Create reset link'}</button>
            </form>
            <p className="auth-foot"><Link to="/login" className="text-link">Back to login</Link></p>
          </>
        )}
      </div>
    </section>
  )
}
