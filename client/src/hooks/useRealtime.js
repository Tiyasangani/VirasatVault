import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'

// Run `handler` whenever the server pushes `event`. The newest handler is always used.
export function useSocketEvent(event, handler) {
  const { socket } = useApp()
  const latest = useRef(handler)
  latest.current = handler
  useEffect(() => {
    if (!socket) return undefined
    const listener = (...args) => latest.current(...args)
    socket.on(event, listener)
    return () => socket.off(event, listener)
  }, [socket, event])
}

// Tell the server "I am looking at this item", so live reviews/comments for it reach this page.
export function useWatch(itemId) {
  const { socket } = useApp()
  useEffect(() => {
    if (!socket || !itemId) return undefined
    const join = () => socket.emit('watch', itemId)
    join()
    socket.on('connect', join)          // join again after a reconnect
    return () => { socket.off('connect', join); socket.emit('unwatch', itemId) }
  }, [socket, itemId])
}
