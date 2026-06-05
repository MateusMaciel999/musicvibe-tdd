import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

import userRouter from './modules/user/user.router.js'
import trackRouter from './modules/track/track.router.js'
import playlistRouter from './modules/playlist/playlist.router.js'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')))

// API
app.use('/api/users', userRouter)
app.use('/api/tracks', trackRouter)
app.use('/api/playlists', playlistRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// 404 SEMPRE POR ÚLTIMO
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada.'
  })
})

export default app