// src/modules/user/user.controller.js
import UserService from './user.service.js'

export class UserController {
  constructor(userService) {
    this.userService = userService
  }

  async register(req, res) {
    try {
      const user = await this.userService.register(req.body)
      return res.status(201).json({ success: true, data: user })
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message })
    }
  }

  async login(req, res) {
    try {
      const user = await this.userService.login(req.body)
      return res.status(200).json({ success: true, data: user })
    } catch (err) {
      return res.status(401).json({ success: false, error: err.message })
    }
  }

  async getById(req, res) {
    try {
      const user = await this.userService.findById(Number(req.params.id))
      return res.status(200).json({ success: true, data: user })
    } catch (err) {
      return res.status(404).json({ success: false, error: err.message })
    }
  }

  async getAll(req, res) {
    try {
      const users = await this.userService.findAll()
      return res.status(200).json({ success: true, data: users })
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message })
    }
  }

  async update(req, res) {
    try {
      const user = await this.userService.update(Number(req.params.id), req.body)
      return res.status(200).json({ success: true, data: user })
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message })
    }
  }

  async delete(req, res) {
    try {
      const result = await this.userService.delete(Number(req.params.id))
      return res.status(200).json({ success: true, data: result })
    } catch (err) {
      return res.status(404).json({ success: false, error: err.message })
    }
  }
}
