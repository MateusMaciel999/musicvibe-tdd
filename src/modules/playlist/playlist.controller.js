// src/modules/playlist/playlist.controller.js
export class PlaylistController {
  constructor(playlistService) {
    this.playlistService = playlistService
  }

  async create(req, res) {
    try {
      const playlist = await this.playlistService.create(req.body)
      return res.status(201).json({ success: true, data: playlist })
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message })
    }
  }

  async getByUser(req, res) {
    try {
      const playlists = await this.playlistService.findByUser(Number(req.params.userId))
      return res.status(200).json({ success: true, data: playlists })
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message })
    }
  }

  async getById(req, res) {
    try {
      const playlist = await this.playlistService.findById(Number(req.params.id))
      return res.status(200).json({ success: true, data: playlist })
    } catch (err) {
      return res.status(404).json({ success: false, error: err.message })
    }
  }

  async addTrack(req, res) {
    try {
      const { trackId, userId } = req.body
      const playlist = await this.playlistService.addTrack(Number(req.params.id), trackId, userId)
      return res.status(200).json({ success: true, data: playlist })
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message })
    }
  }

  async delete(req, res) {
    try {
      const { userId } = req.body
      const result = await this.playlistService.delete(Number(req.params.id), userId)
      return res.status(200).json({ success: true, data: result })
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message })
    }
  }
}
