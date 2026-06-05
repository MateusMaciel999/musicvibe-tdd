// src/modules/playlist/playlist.router.js
import { Router } from 'express'
import Playlist from './playlist.model.js'
import PlaylistService from './playlist.service.js'
import { PlaylistController } from './playlist.controller.js'

const router = Router()
const service = new PlaylistService(Playlist)
const controller = new PlaylistController(service)

router.post('/', (req, res) => controller.create(req, res))
router.get('/user/:userId', (req, res) => controller.getByUser(req, res))
router.get('/:id', (req, res) => controller.getById(req, res))
router.post('/:id/tracks', (req, res) => controller.addTrack(req, res))
router.delete('/:id', (req, res) => controller.delete(req, res))

export default router
