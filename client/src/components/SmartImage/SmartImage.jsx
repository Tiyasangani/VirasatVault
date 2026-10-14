import { useEffect, useState } from 'react'
import { Landmark } from 'lucide-react'
import { PHOTO_DETAILS } from '../../data/imageDetails'
import { fallbackSrc } from '../../data/fallbackArt'

const photoKey = (src = '') => (String(src).match(/(photo-[0-9a-f]+-[0-9a-f]+)/i) || [])[1]

// Lazy-loaded image. If the photograph cannot load (offline, blocked network, expired link) it shows a
// built-in illustration of the same subject, or a tidy label, so a broken URL never leaves an empty hole.
export default function SmartImage({ src, alt, ratio = '4 / 3', className = '', eager = false, style }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])
  const subject = PHOTO_DETAILS[photoKey(src)]?.subject
  const art = failed || !src ? fallbackSrc(subject) : null

  return (
    <div className={`smart-img ${className}`} style={{ aspectRatio: ratio, ...style }}>
      {art ? (
        <img src={art} alt={alt} className="img-art" loading="lazy" decoding="async" />
      ) : failed || !src ? (
        <div className="img-fallback" role="img" aria-label={alt}>
          <Landmark size={22} strokeWidth={1.4} aria-hidden="true" />
          <span>{alt}</span>
        </div>
      ) : (
        <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />
      )}
    </div>
  )
}
