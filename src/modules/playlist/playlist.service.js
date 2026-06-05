// src/modules/playlist/playlist.service.js

export class PlaylistService {
  constructor(playlistModel) {
    this.playlistModel = playlistModel
  }

  async create({ name, userId, isPublic = false }) {
    if (!name || name.trim().length < 1) throw new Error('Nome da playlist é obrigatório.')
    if (!userId) throw new Error('ID do usuário é obrigatório.')

    const playlist = await this.playlistModel.create({
      name: name.trim(),
      userId,
      isPublic,
      trackIds: [],
    })
    return playlist
  }

  async findByUser(userId) {
    return this.playlistModel.findAll({ where: { userId } })
  }

  async findById(id) {
    const playlist = await this.playlistModel.findByPk(id)
    if (!playlist) throw new Error('Playlist não encontrada.')
    return playlist
  }

  async addTrack(playlistId, trackId, userId) {
    const playlist = await this.playlistModel.findByPk(playlistId)
    if (!playlist) throw new Error('Playlist não encontrada.')
    if (playlist.userId !== userId) throw new Error('Sem permissão para editar esta playlist.')

    const current = playlist.trackIds || []
    if (current.includes(trackId)) throw new Error('Faixa já está na playlist.')

    playlist.trackIds = [...current, trackId]
    await playlist.save()
    return playlist
  }

  async removeTrack(playlistId, trackId, userId) {
    const playlist = await this.playlistModel.findByPk(playlistId)
    if (!playlist) throw new Error('Playlist não encontrada.')
    if (playlist.userId !== userId) throw new Error('Sem permissão para editar esta playlist.')

    playlist.trackIds = (playlist.trackIds || []).filter(id => id !== trackId)
    await playlist.save()
    return playlist
  }

  async delete(id, userId) {
    const playlist = await this.playlistModel.findByPk(id)
    if (!playlist) throw new Error('Playlist não encontrada.')
    if (playlist.userId !== userId) throw new Error('Sem permissão para deletar esta playlist.')
    await playlist.destroy()
    return { message: 'Playlist removida com sucesso.' }
  }
}

export default PlaylistService
