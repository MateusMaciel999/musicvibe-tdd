// src/server.js
import app from './app.js'
import sequelize from './database/connection.js'
import User from './modules/user/user.model.js'
import Track from './modules/track/track.model.js'
import Playlist from './modules/playlist/playlist.model.js'
import Genre from './modules/genre/genre.model.js'

const PORT = process.env.PORT || 3000

async function start() {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ alter: true })
    console.log('✅ Banco de dados sincronizado.')

    app.listen(PORT, () => {
      console.log(`🎵 MusicVibe rodando em http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('❌ Erro ao iniciar o servidor:', err)
    process.exit(1)
  }
}

start()
