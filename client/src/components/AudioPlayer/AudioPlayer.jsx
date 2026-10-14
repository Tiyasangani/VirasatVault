import { useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { formatDuration } from '../../utils/format'
import { villageName } from '../../data'
import AddToPlaylist from '../AddToPlaylist/AddToPlaylist'

// Plays the real recording when `story.audioUrl` exists. Without a file it falls back to a
// simulated timer so demo records without audio still look complete (and says so).
export default function AudioPlayer({ story, autoPlay = false, onEnded, hideActions = false }) {
  const hasAudio = Boolean(story.audioUrl)
  const audio = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(story.duration)
  const [failed, setFailed] = useState(false)

  // Simulated playback (no file attached).
  useEffect(() => {
    if (hasAudio || !playing) return undefined
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000 / 8) // 8x speed so the demo is easy to see
    return () => clearInterval(timer)
  }, [hasAudio, playing])
  useEffect(() => {
    if (!hasAudio && playing && elapsed >= duration) { setPlaying(false); setElapsed(0); onEnded?.() }
  }, [hasAudio, playing, elapsed, duration]) // eslint-disable-line

  // Used by "Play all": start by itself when this track is shown.
  useEffect(() => {
    if (!autoPlay) return
    if (hasAudio) audio.current?.play().catch(() => setPlaying(false))
    else setPlaying(true)
  }, []) // eslint-disable-line

  const toggle = async () => {
    if (!hasAudio) { setPlaying((p) => !p); return }
    try {
      if (playing) { audio.current.pause() } else { await audio.current.play() }
    } catch { setFailed(true) }
  }
  const seek = (value) => {
    setElapsed(value)
    if (hasAudio && audio.current) audio.current.currentTime = value
  }

  const bars = useMemo(() => Array.from({ length: 48 }, (_, i) => 22 + Math.abs(Math.sin(i * 1.7 + story.title.length) * 38) + (i % 5) * 4), [story.title])
  const progress = duration ? (elapsed / duration) * 100 : 0

  return (
    <article className="audio">
      <button type="button" className="audio-play" onClick={toggle} aria-label={playing ? `Pause ${story.title}` : `Play ${story.title}`}>
        {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
      </button>
      <div className="audio-main">
        <div className="row-between audio-title"><h3 className="card-title">{story.title}</h3>{!hideActions && <AddToPlaylist itemId={story.id} compact />}</div>
        <p className="meta">{story.speaker}, {villageName(story.village)}</p>
        <p className="card-text">{story.description}</p>
        <div className="wave" aria-hidden="true">
          {bars.map((h, i) => <span key={i} style={{ height: `${h}%` }} className={(i / bars.length) * 100 < progress ? 'done' : ''} />)}
        </div>
        <div className="audio-bar">
          <span className="meta">{formatDuration(elapsed)}</span>
          <input type="range" min="0" max={duration || 1} value={Math.min(elapsed, duration || 1)} onChange={(e) => seek(Number(e.target.value))} aria-label={`Seek ${story.title}`} />
          <span className="meta">{formatDuration(duration)}</span>
        </div>
        {!hasAudio && <p className="meta audio-note">Sample playback. No recording has been attached to this record yet.</p>}
        {failed && <p className="meta audio-note" role="alert">This recording could not be played.</p>}
        {hasAudio && (
          <audio ref={audio} src={story.audioUrl} preload="metadata"
            onLoadedMetadata={(e) => Number.isFinite(e.target.duration) && setDuration(Math.round(e.target.duration))}
            onTimeUpdate={(e) => setElapsed(Math.floor(e.target.currentTime))}
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
            onEnded={() => { setPlaying(false); setElapsed(0); onEnded?.() }} onError={() => setFailed(true)} />
        )}
      </div>
    </article>
  )
}
