import { Server } from 'socket.io'
import { config } from './config.js'
import { userFromToken } from './middleware/auth.js'

// Socket.IO "rooms" decide who receives what:
//   user:<id>      one person (their private notifications)
//   role:admin     every reviewer
//   watch:<item>   everyone currently looking at a record/story (live reviews and comments)
let io = null
const ITEM = /^[a-z]-?[a-z0-9-]{1,38}$/

export function initRealtime(httpServer) {
  io = new Server(httpServer, { cors: { origin: config.clientOrigin.split(',') } })

  // Visitors may connect without logging in (they still get live content updates).
  // A valid token additionally puts the socket in the user's private rooms.
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token
    const user = token ? await userFromToken(token) : null   // an invalid or old token simply makes this a visitor
    socket.data.user = user && !user.banned ? user : null
    next()
  })

  io.on('connection', (socket) => {
    const user = socket.data.user
    if (user) {
      socket.join(`user:${user.id}`)
      if (user.role === 'admin') socket.join('role:admin')
    }
    socket.on('watch', (id) => { if (typeof id === 'string' && ITEM.test(id)) socket.join(`watch:${id}`) })
    socket.on('unwatch', (id) => { if (typeof id === 'string') socket.leave(`watch:${id}`) })
  })
  return io
}

// These do nothing when the socket server is not running (for example in scripts).
export const emitToUser = (userId, event, payload) => io?.to(`user:${userId}`).emit(event, payload)
export const emitToAdmins = (event, payload) => io?.to('role:admin').emit(event, payload)
export const emitToWatchers = (itemId, event, payload) => io?.to(`watch:${itemId}`).emit(event, payload)
export const disconnectUser = (userId) => io?.in(`user:${userId}`).disconnectSockets(true)
export const emitToAll = (event, payload) => io?.emit(event, payload)
