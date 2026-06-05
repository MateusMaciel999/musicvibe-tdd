// src/modules/track/track.service.js

export class TrackService {
  constructor(trackModel) {
    this.trackModel = trackModel
  }

  async create({ title, artist, album, durationSeconds, fileUrl, genreId }) {
    if (!title || title.trim().length < 1) throw new Error('Título é obrigatório.')
    if (!artist || artist.trim().length < 1) throw new Error('Artista é obrigatório.')
    if (!durationSeconds || durationSeconds <= 0) throw new Error('Duração deve ser maior que zero.')
    if (!fileUrl || fileUrl.trim().length < 1) throw new Error('URL do arquivo é obrigatória.')

    const track = await this.trackModel.create({
      title: title.trim(),
      artist: artist.trim(),
      album: album ? album.trim() : null,
      durationSeconds,
      fileUrl: fileUrl.trim(),
      genreId: genreId || null,
      plays: 0,
    })

    return track
  }

  async findAll({ genreId } = {}) {
    const where = genreId ? { genreId } : {}
    return this.trackModel.findAll({ where })
  }

  async findById(id) {
    const track = await this.trackModel.findByPk(id)
    if (!track) throw new Error('Faixa não encontrada.')
    return track
  }

  async incrementPlays(id) {
    const track = await this.trackModel.findByPk(id)
    if (!track) throw new Error('Faixa não encontrada.')
    track.plays = (track.plays || 0) + 1
    await track.save()
    return track
  }

  async delete(id) {
    const track = await this.trackModel.findByPk(id)
    if (!track) throw new Error('Faixa não encontrada.')
    await track.destroy()
    return { message: 'Faixa removida com sucesso.' }
  }
}

export default TrackService
