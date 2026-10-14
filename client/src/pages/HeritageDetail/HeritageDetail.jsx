import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Flag, Heart, Link2, MapPin, Share2 } from 'lucide-react'
import PhotoFigure from '../../components/PhotoFigure/PhotoFigure'
import ImageGallery from '../../components/ImageGallery/ImageGallery'
import ListenButton from '../../components/ListenButton/ListenButton'
import TrailButton from '../../components/TrailButton/TrailButton'
import { VerifiedMark } from '../../components/Badge/Badge'
import BookmarkButton from '../../components/BookmarkButton/BookmarkButton'
import Timeline from '../../components/Timeline/Timeline'
import MapPreview from '../../components/MapPreview/MapPreview'
import QRCard from '../../components/QRCard/QRCard'
import ReportModal from '../../components/ReportModal/ReportModal'
import StoryCard from '../../components/StoryCard/StoryCard'
import HeritageCard from '../../components/HeritageCard/HeritageCard'
import { getHeritage, villageName, stories, exploreItems, mapPoints } from '../../data'
import { categoryLabel } from '../../data/categories'
import { useApp } from '../../context/AppContext'
import { api } from '../../api/client'
import Reviews from '../../components/Reviews/Reviews'
import AddToPlaylist from '../../components/AddToPlaylist/AddToPlaylist'
import { useSocketEvent, useWatch } from '../../hooks/useRealtime'
import NotFound from '../NotFound/NotFound'
import { DEMO } from '../../config'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { formatDate } from '../../utils/format'

export default function HeritageDetail() {
  const { slug } = useParams()
  const record = getHeritage(slug)
  const { isLiked, toggleLike, user, showToast } = useApp()
  const [list, setList] = useState([])
  const [reporting, setReporting] = useState(false)
  const [comment, setComment] = useState('')
  const [commentError, setCommentError] = useState('')
  useDocumentTitle(record?.title)
  useWatch(record?.id)   // so new comments and reviews on this page arrive instantly
  useSocketEvent('comment:new', ({ targetId, comment: incoming }) => {
    if (record && targetId === record.id) setList((prev) => (prev.some((c) => c.id === incoming.id) ? prev : [...prev, incoming]))
  })
  useSocketEvent('comment:removed', ({ targetId, id }) => {
    if (record && targetId === record.id) setList((prev) => prev.filter((c) => c.id !== id))
  })
  useEffect(() => {
    if (record) api.getComments(record.id).then(setList).catch(() => setList([]))
  }, [record?.id]) // eslint-disable-line
  if (!record) return <NotFound />

  const liked = isLiked(record.id)
  const photos = [...new Set([record.image, ...(record.gallery ?? [])].filter(Boolean))]
  const photoCtx = { title: record.title, village: villageName(record.village), district: record.district, kind: 'Heritage record', href: `/heritage/${record.slug}` }
  const spoken = [record.title, ...record.description, `Historical significance. ${record.significance}`].join('. ')
  const relatedStories = stories.filter((s) => s.village === record.village).slice(0, 2)
  const related = exploreItems.filter((i) => i.kind === 'heritage' && i.village === record.village && i.id !== record.id).slice(0, 3)

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); showToast('Link copied') } catch { showToast('Copy the link from the address bar') }
  }
  const submitComment = async (e) => {
    e.preventDefault()
    if (!user) { setCommentError('Log in to post a comment.'); return }
    if (comment.trim().length < 3) { setCommentError('Write a few words before posting.'); return }
    try {
      const created = await api.addComment(record.id, comment.trim())
      setList((prev) => (prev.some((c) => c.id === created.id) ? prev : [...prev, created]))
      setComment(''); setCommentError('')
    } catch (err) { setCommentError(err.fields?.text ?? err.message) }
  }

  return (
    <>
      <header className="record-hero">
        <div className="container">
          <p className="breadcrumb"><Link to="/explore">Explore</Link> / <Link to={`/explore?category=${record.category}`}>{categoryLabel(record.category)}</Link></p>
          <div className="record-head">
            <div>
              <h1>{record.title}</h1>
              <p className="record-sub with-icon"><MapPin size={16} aria-hidden="true" /> <Link to={`/villages/${record.village}`} className="text-link">{villageName(record.village)}</Link>, {record.district} District. {record.period}.</p>
            </div>
            <div className="record-actions">
              <button type="button" className={`icon-btn ${liked ? 'is-liked' : ''}`} onClick={() => toggleLike(record.id)} aria-pressed={liked}><Heart size={18} fill={liked ? 'currentColor' : 'none'} /><span>{record.likes + (liked ? 1 : 0)}</span></button>
              <BookmarkButton type="places" id={record.id} label />
              <AddToPlaylist itemId={record.id} />
              <ListenButton text={spoken} />
              <TrailButton id={record.id} />
              <button type="button" className="icon-btn" onClick={share}><Share2 size={18} /><span>Share</span></button>
            </div>
          </div>
        </div>
        <div className="container"><PhotoFigure src={photos[0]} images={photos} index={0} ctx={photoCtx} ratio="21 / 9" eager imgClass="record-img" /></div>
      </header>

      <section className="section-tight">
        <div className="container article-grid">
          <article className="prose">
            <div className="record-status"><VerifiedMark verified={record.verified} /><span className="meta">Record {record.recordNo}</span></div>
            <h2>About this heritage</h2>
            {record.description.map((p, i) => <p key={i}>{p}</p>)}
            <h2>Historical significance</h2>
            <p>{record.significance}</p>
            <h2>Timeline</h2>
            <Timeline layout="vertical" items={record.timeline} />
            <h2>Photo gallery</h2>
            <p className="meta gallery-note">{photos.length} photograph{photos.length === 1 ? '' : 's'}. Select a picture to read its full description.</p>
            <ImageGallery images={photos} ctx={photoCtx} small ratios={['3 / 2', '4 / 3']} />
            <h2 id="sources">Source / References</h2>
            <ul className="sources">
              {record.sources.map((s) => <li key={s.title}><Link2 size={15} aria-hidden="true" /><span>{s.title}<span className="meta"> ({s.type})</span></span></li>)}
            </ul>
            {DEMO && <p className="meta">Demonstration record. In the live archive, every source is checked by a reviewer before the Verified mark is shown.</p>}
          </article>

          <aside className="side-stack">
            <dl className="fact-list">
              <dt>Category</dt><dd>{categoryLabel(record.category)}</dd>
              <dt>Heritage type</dt><dd>{record.htype}</dd>
              <dt>Period</dt><dd>{record.period}</dd>
              <dt>Date</dt><dd>{record.yearLabel}</dd>
              <dt>Contributor</dt><dd>{record.contributor}</dd>
              <dt>Status</dt><dd><VerifiedMark verified={record.verified} /></dd>
            </dl>
            <button type="button" className="text-link with-icon" onClick={() => setReporting(true)}><Flag size={14} aria-hidden="true" /> Report incorrect information</button>
            {record.verified && <QRCard record={record} />}
          </aside>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container split">
          <div className="split-text"><h2>Location</h2><p>{villageName(record.village)}, {record.district} District. Approximate position shown.</p></div>
          <MapPreview points={mapPoints.filter((p) => p.id === record.id)} selectedId={null} onSelect={() => {}} height={340} />
        </div>
      </section>

      {relatedStories.length > 0 && (
        <section className="section">
          <div className="container"><h2>Related stories</h2><div className="grid-cards stories-row">{relatedStories.map((s) => <StoryCard key={s.id} story={s} />)}</div></div>
        </section>
      )}

      <section className="section">
        <div className="container narrow">
          <h2>Reviews</h2>
          <Reviews targetId={record.id} />
        </div>
      </section>

      <section className="section section-tint">
        <div className="container narrow">
          <h2>Comments</h2>
          <ul className="comments">
            {list.length === 0 && <li className="muted">No comments yet. Add a memory or a correction.</li>}
            {list.map((c) => <li key={c.id}><p className="comment-author">{c.author}<span className="meta"> {formatDate(c.date, { day: 'numeric', month: 'short', year: 'numeric' })}</span>{user?.role === 'admin' && <button type="button" className="text-link comment-remove" onClick={async () => { if (window.confirm('Remove this comment?')) { try { await api.admin.deleteComment(c.id.replace('cm', '')); setList((prev) => prev.filter((x) => x.id !== c.id)) } catch (err) { showToast(err.message) } } }}>Remove</button>}</p><p>{c.text}</p></li>)}
          </ul>
          <form onSubmit={submitComment} noValidate>
            <div className={`field ${commentError ? 'has-error' : ''}`}>
              <label htmlFor="comment">Add a comment{user ? '' : ' (log in to post)'}</label>
              <textarea id="comment" rows="3" value={comment} onChange={(e) => setComment(e.target.value)} />
              {commentError && <p className="field-error">{commentError}</p>}
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Post comment</button>
          </form>
        </div>
      </section>

      {related.length > 0 && <section className="section"><div className="container"><h2>More from {villageName(record.village)}</h2><div className="grid-cards">{related.map((p) => <HeritageCard key={p.id} item={p} />)}</div></div></section>}
      {reporting && <ReportModal target={record.title} onClose={() => setReporting(false)} />}
    </>
  )
}
