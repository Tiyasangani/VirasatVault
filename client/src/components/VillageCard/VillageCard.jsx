import { Link } from 'react-router-dom'
import SmartImage from '../SmartImage/SmartImage'
import BookmarkButton from '../BookmarkButton/BookmarkButton'
import { recordsInVillage } from '../../data'

export default function VillageCard({ village, tall = false }) {
  const count = recordsInVillage(village.slug)
  return (
    <article className="v-card">
      <Link to={`/villages/${village.slug}`} aria-label={`Explore ${village.name}`}>
        <SmartImage src={village.image} alt={`${village.name}, ${village.district} District`} ratio={tall ? '3 / 4' : '4 / 3'} />
      </Link>
      <div className="v-card-body">
        <div className="v-card-head">
          <div>
            <h3 className="card-title">{village.name}</h3>
            <p className="meta">{village.district} District</p>
          </div>
          <BookmarkButton type="villages" id={village.id} />
        </div>
        <p className="card-text">{village.summary}</p>
        <div className="v-card-foot">
          <span className="meta">{count} heritage record{count === 1 ? '' : 's'}</span>
          <Link to={`/villages/${village.slug}`} className="text-link">Explore {village.name}</Link>
        </div>
      </div>
    </article>
  )
}
