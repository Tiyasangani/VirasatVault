import { Maximize2 } from 'lucide-react'
import SmartImage from '../SmartImage/SmartImage'
import { useLightbox } from '../Lightbox/Lightbox'
import { getImageInfo } from '../../data/imageDetails'

// A picture with a visible caption and a "Photo details" button that opens the full viewer.
//   images : all pictures of the page (so Next / Previous work); defaults to just this one
//   ctx    : { title, village, district, kind, href }  describes the page the pictures belong to
//   items  : optional [{ src, ctx }] when every picture has its own context (used by the Gallery page)
export default function PhotoFigure({ src, ctx = {}, images, items, index = 0, ratio = '3 / 2', eager = false, className = '', imgClass = '', showCaption = true }) {
  const { openLightbox } = useLightbox()
  const total = items ? items.length : (images?.length || 1)
  const list = items ?? (images?.length ? images : [src]).map((s, i) => ({ src: s, ctx: { ...ctx, index: i, total } }))
  const own = items ? { ...items[index].ctx, index, total } : { ...ctx, index, total }
  const info = getImageInfo(src, own)
  const open = () => openLightbox(list, index)
  return (
    <figure className={`photo-fig ${className}`}>
      <div className="photo-fig-media">
        <SmartImage src={src} alt={info.alt} ratio={ratio} eager={eager} className={imgClass} />
        <button type="button" className="photo-fig-btn" onClick={open} aria-label={`Photo details: ${info.heading}`}>
          <Maximize2 size={15} aria-hidden="true" /><span>Photo details</span>
        </button>
      </div>
      {showCaption && (
        <figcaption className="photo-fig-cap">
          <strong>{info.heading}</strong>
          <span>{info.caption}</span>
        </figcaption>
      )}
    </figure>
  )
}
