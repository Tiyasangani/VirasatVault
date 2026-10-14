import { Link, useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import PhotoFigure from '../../components/PhotoFigure/PhotoFigure'
import ListenButton from '../../components/ListenButton/ListenButton'
import BookmarkButton from '../../components/BookmarkButton/BookmarkButton'
import StoryCard from '../../components/StoryCard/StoryCard'
import { getStory, stories, villageName } from '../../data'
import { useApp } from '../../context/AppContext'
import { formatDate } from '../../utils/format'
import Reviews from '../../components/Reviews/Reviews'
import AddToPlaylist from '../../components/AddToPlaylist/AddToPlaylist'
import NotFound from '../NotFound/NotFound'
import { DEMO } from '../../config'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function StoryDetail() {
  const { slug } = useParams()
  const story = getStory(slug)
  const { isLiked, toggleLike } = useApp()
  useDocumentTitle(story?.title)
  if (!story) return <NotFound />
  const liked = isLiked(story.id)
  const more = stories.filter((s) => s.id !== story.id).slice(0, 3)
  return (
    <>
      <article className="container story-page">
        <p className="breadcrumb"><Link to="/stories">Stories</Link> / {story.category}</p>
        <h1>{story.title}</h1>
        <p className="byline story-by">By {story.contributor}, {villageName(story.village)}, {story.district} District. {story.readTime} min read. {formatDate(story.date)}</p>
        <PhotoFigure src={story.image} ctx={{ title: story.title, village: villageName(story.village), district: story.district, kind: 'Story', href: `/stories/${story.slug}` }} ratio="16 / 9" eager />
        <div className="story-tools">
          <button className={`icon-btn ${liked ? 'is-liked' : ''}`} onClick={() => toggleLike(story.id)} aria-pressed={liked}><Heart size={18} fill={liked ? 'currentColor' : 'none'} /><span>{story.likes + (liked ? 1 : 0)}</span></button>
          <BookmarkButton type="stories" id={story.id} label />
          <AddToPlaylist itemId={story.id} />
          <ListenButton text={[story.title, story.excerpt, ...story.body].join('. ')} label="Listen to this story" />
        </div>
        <div className="prose story-body">
          <p className="lede">{story.excerpt}</p>
          {story.body.map((p, i) => <p key={i}>{p}</p>)}
          {DEMO && <p className="meta">Sample story for demonstration. Contributor details are fictional.</p>}
        </div>
        <section className="story-reviews"><h2>Reviews</h2><Reviews targetId={story.id} /></section>
      </article>
      <section className="section section-tint"><div className="container"><h2>More stories</h2><div className="grid-cards stories-row">{more.map((s) => <StoryCard key={s.id} story={s} />)}</div></div></section>
    </>
  )
}
