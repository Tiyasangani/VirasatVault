import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { api } from '../../api/client'
import { useApp } from '../../context/AppContext'
import { useSocketEvent, useWatch } from '../../hooks/useRealtime'
import { formatDate } from '../../utils/format'

export function Stars({ value, size = 16 }) {
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={size} fill={n <= Math.round(value) ? 'currentColor' : 'none'} aria-hidden="true" />)}
    </span>
  )
}

// Ratings and reviews for one item (targetId such as "h3" for a record or "s1" for a story).
// New reviews from other people appear here instantly.
export default function Reviews({ targetId }) {
  const { user } = useApp()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => api.reviews(targetId).then(setData).catch(() => setError('Reviews could not be loaded.')), [targetId])
  useEffect(() => { setData(null); load() }, [load, user?.id])
  useWatch(targetId)
  useSocketEvent('review:changed', (p) => { if (p.targetId === targetId) load() })

  // Pre-fill the form with the person's own review so they can edit it.
  useEffect(() => {
    setRating(data?.mine?.rating ?? 0)
    setText(data?.mine?.text ?? '')
  }, [data?.mine?.id, data?.mine?.date]) // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault()
    if (!rating) { setFormError('Choose a star rating first.'); return }
    setBusy(true); setFormError('')
    try { await api.saveReview({ targetId, rating, text }); await load() } catch (err) { setFormError(err.fields?.rating ?? err.fields?.text ?? err.message) } finally { setBusy(false) }
  }
  const remove = async () => { try { await api.deleteReview(targetId); setRating(0); setText(''); await load() } catch (err) { setFormError(err.message) } }

  if (error) return <p className="muted">{error}</p>
  if (!data) return <p className="muted">Loading reviews...</p>

  return (
    <div className="reviews">
      <div className="reviews-summary">
        <span className="reviews-score">{data.count ? data.average.toFixed(1) : '–'}</span>
        <div><Stars value={data.average} size={20} /><p className="meta">{data.count ? `${data.count} review${data.count === 1 ? '' : 's'}` : 'No reviews yet'}</p></div>
      </div>

      {user ? (
        <form onSubmit={submit} noValidate className="review-form">
          <fieldset className="rating-input">
            <legend className="label">{data.mine ? 'Your review' : 'Rate this'}</legend>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n}>
                <input id={`${targetId}-star-${n}`} className="sr-only" type="radio" name={`rating-${targetId}`} value={n} checked={rating === n} onChange={() => setRating(n)} />
                <label htmlFor={`${targetId}-star-${n}`} aria-label={`${n} star${n === 1 ? '' : 's'}`}><Star size={26} fill={n <= rating ? 'currentColor' : 'none'} aria-hidden="true" /></label>
              </span>
            ))}
          </fieldset>
          <div className={`field ${formError ? 'has-error' : ''}`}>
            <label htmlFor={`${targetId}-review-text`} className="sr-only">Written review (optional)</label>
            <textarea id={`${targetId}-review-text`} rows="3" maxLength={600} value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a few words about it (optional)" />
            <div className="field-foot">{formError ? <p className="field-error" role="alert">{formError}</p> : <span />}<span className="count">{text.length}/600</span></div>
          </div>
          <div className="form-actions review-actions-left">
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Saving...' : data.mine ? 'Update review' : 'Post review'}</button>
            {data.mine && <button type="button" className="btn btn-ghost btn-sm" onClick={remove}>Delete my review</button>}
          </div>
        </form>
      ) : (
        <p className="muted"><Link to="/login" className="text-link">Log in</Link> to leave a rating.</p>
      )}

      <ul className="review-list-public">
        {data.reviews.map((r) => (
          <li key={r.id}>
            <div className="row-between"><strong>{r.author}</strong><span className="meta">{formatDate(r.date, { day: 'numeric', month: 'short', year: 'numeric' })}{user?.role === 'admin' && <button type="button" className="text-link comment-remove" onClick={async () => { if (window.confirm('Remove this review?')) { await api.admin.deleteReview(r.id).catch(() => {}); load() } }}>Remove</button>}</span></div>
            <Stars value={r.rating} />
            {r.text && <p>{r.text}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
