// src/modules/track/track.controller.js
export class TrackController {
  constructor(trackService) {
    this.trackService = trackService
  }

  async create(req, res) {
    try {
      const track = await this.trackService.create(req.body)
      return res.status(201).json({ success: true, data: track })
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message })
    }
  }

  async getAll(req, res) {
    try {
      const { genreId } = req.query
      const tracks = await this.trackService.findAll({ genreId: genreId ? Number(genreId) : undefined })
      return res.status(200).json({ success: true, data: tracks })
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message })
    }
  }

  async getById(req, res) {
    try {
      const track = await this.trackService.findById(Number(req.params.id))
      return res.status(200).json({ success: true, data: track })
    } catch (err) {
      return res.status(404).json({ success: false, error: err.message })
    }
  }

  async play(req, res) {
    try {
      const track = await this.trackService.incrementPlays(Number(req.params.id))
      return res.status(200).json({ success: true, data: track })
    } catch (err) {
      return res.status(404).json({ success: false, error: err.message })
    }
  }

  async delete(req, res) {
    try {
      const result = await this.trackService.delete(Number(req.params.id))
      return res.status(200).json({ success: true, data: result })
    } catch (err) {
      return res.status(404).json({ success: false, error: err.message })
    }
  }
}
