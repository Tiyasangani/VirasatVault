import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import SmartImage from '../SmartImage/SmartImage'
import BookmarkButton from '../BookmarkButton/BookmarkButton'
import { VerifiedMark } from '../Badge/Badge'
import { categoryLabel } from '../../data/categories'
import { villageName } from '../../data'

const BOOKMARK_TYPE = { heritage: 'places', story: 'stories', village: 'villages' }

// item comes from `exploreItems`. variant: grid (default) | list | feature
export default function HeritageCard({ item, variant = 'grid' }) {
  const ratio = variant === 'feature' ? '16 / 10' : variant === 'list' ? '1 / 1' : '4 / 3'
  return (
    <article className={`h-card h-card-${variant}`}>
      <Link to={item.href} className="h-card-media" aria-label={item.title}>
        <SmartImage src={item.image} alt={item.title} ratio={ratio} />
      </Link>
      <div className="h-card-body">
        <p className="meta">{categoryLabel(item.category)}{item.year ? `, ${item.year}` : ''}</p>
        <h3 className="card-title"><Link to={item.href}>{item.title}</Link></h3>
        <p className="card-text">{item.summary}</p>
        <div className="h-card-foot">
          <span className="meta with-icon"><MapPin size={14} aria-hidden="true" /> {villageName(item.village)}, {item.district}</span>
          {item.kind === 'heritage' && <VerifiedMark verified={item.verified} />}
        </div>
      </div>
      <BookmarkButton type={BOOKMARK_TYPE[item.kind]} id={item.id} className="h-card-save" />
    </article>
  )
}
