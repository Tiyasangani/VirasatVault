import { Link } from 'react-router-dom'
import SmartImage from '../SmartImage/SmartImage'
import BookmarkButton from '../BookmarkButton/BookmarkButton'
import { villageName } from '../../data'
import { formatDate } from '../../utils/format'

export default function StoryCard({ story, variant = 'standard' }) {
  const ratio = variant === 'feature' ? '3 / 2' : variant === 'compact' ? '1 / 1' : '4 / 3'
  return (
    <article className={`s-card s-card-${variant}`}>
      <Link to={`/stories/${story.slug}`} className="s-card-media" aria-label={story.title}>
        <SmartImage src={story.image} alt={story.title} ratio={ratio} />
      </Link>
      <div className="s-card-body">
        <p className="meta">{story.category}</p>
        <h3 className={variant === 'feature' ? 'feature-title' : 'card-title'}>
          <Link to={`/stories/${story.slug}`}>{story.title}</Link>
        </h3>
        {variant !== 'compact' && <p className="card-text">{story.excerpt}</p>}
        <p className="byline">
          By {story.contributor}, {villageName(story.village)}. {story.readTime} min read. {formatDate(story.date, { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      {variant !== 'compact' && <BookmarkButton type="stories" id={story.id} className="s-card-save" />}
    </article>
  )
}
