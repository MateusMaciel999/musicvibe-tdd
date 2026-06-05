// src/app.js
import express from 'express'
import userRouter from './modules/user/user.router.js'
import trackRouter from './modules/track/track.router.js'
import playlistRouter from './modules/playlist/playlist.router.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Rotas da API ──────────────────────────────────────────
app.use('/api/users', userRouter)
app.use('/api/tracks', trackRouter)
app.use('/api/playlists', playlistRouter)

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'MusicVibe', version: '1.0.0' })
})

// ── 404 handler ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Rota não encontrada.' })
})

export default app
