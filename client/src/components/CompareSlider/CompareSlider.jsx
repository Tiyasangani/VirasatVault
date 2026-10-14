import { useState } from 'react'

// "Old" is the same file with a sepia filter in this prototype. Pass a real archive scan as `oldSrc` later.
export default function CompareSlider({ nowSrc, oldSrc, place, year }) {
  const [pos, setPos] = useState(50)
  const [failed, setFailed] = useState(false)
  return (
    <div className="compare">
      <div className="compare-frame">
        {failed ? (
          <div className="img-fallback compare-fallback"><span>{place}</span></div>
        ) : (
          <>
            <img className="compare-img" src={nowSrc} alt={`${place}, present day`} loading="lazy" onError={() => setFailed(true)} />
            <img className="compare-img compare-old" src={oldSrc ?? nowSrc} alt={`${place}, ${year}`} loading="lazy" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
          </>
        )}
        <span className="compare-tag compare-tag-left">{year}</span>
        <span className="compare-tag compare-tag-right">Today</span>
        <span className="compare-line" style={{ left: `${pos}%` }} aria-hidden="true"><span className="compare-knob" /></span>
        <input className="compare-range" type="range" min="2" max="98" value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label={`Compare ${year} and present day view of ${place}`} />
      </div>
    </div>
  )
}
