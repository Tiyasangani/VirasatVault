import { useState } from 'react'
import { SkipBack, SkipForward } from 'lucide-react'
import AudioPlayer from './AudioPlayer'

// "Play all": plays the recordings of a playlist one after another.
export default function PlaylistPlayer({ tracks, onClose }) {
  const [index, setIndex] = useState(0)
  const track = tracks[index]
  const go = (n) => setIndex((i) => Math.min(Math.max(i + n, 0), tracks.length - 1))
  return (
    <section className="pl-player" aria-label="Playing playlist recordings">
      <div className="row-between">
        <p className="meta pl-now">Recording {index + 1} of {tracks.length}</p>
        <div className="pl-skip">
          <button type="button" className="icon-btn" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous recording"><SkipBack size={18} /></button>
          <button type="button" className="icon-btn" onClick={() => go(1)} disabled={index === tracks.length - 1} aria-label="Next recording"><SkipForward size={18} /></button>
          <button type="button" className="text-link" onClick={onClose}>Close player</button>
        </div>
      </div>
      {/* key makes a fresh player (that starts by itself) for each recording */}
      <AudioPlayer key={track.id} story={track} autoPlay hideActions onEnded={() => (index < tracks.length - 1 ? go(1) : onClose())} />
    </section>
  )
}
