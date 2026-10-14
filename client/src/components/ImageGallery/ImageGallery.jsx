import PhotoFigure from '../PhotoFigure/PhotoFigure'

// A gallery of captioned photographs. Clicking any of them opens the viewer on that photograph.
export default function ImageGallery({ images = [], ctx = {}, small = false, ratios }) {
  if (!images.length) return null
  const defaults = small ? ['3 / 2', '4 / 3'] : ['4 / 5', '3 / 2', '1 / 1', '3 / 2']
  const pick = ratios ?? defaults
  return (
    <div className={`gallery ${small ? 'gallery-sm' : ''}`}>
      {images.map((src, i) => (
        <PhotoFigure key={`${src}-${i}`} src={src} images={images} index={i} ctx={ctx} ratio={i === 0 && small ? '3 / 2' : pick[i % pick.length]} />
      ))}
    </div>
  )
}
