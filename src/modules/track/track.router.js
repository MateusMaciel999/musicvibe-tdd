// src/modules/track/track.router.js
import { Router } from 'express'
import Track from './track.model.js'
import TrackService from './track.service.js'
import { TrackController } from './track.controller.js'

const router = Router()
const service = new TrackService(Track)
const controller = new TrackController(service)

router.post('/', (req, res) => controller.create(req, res))
router.get('/', (req, res) => controller.getAll(req, res))
router.get('/:id', (req, res) => controller.getById(req, res))
router.post('/:id/play', (req, res) => controller.play(req, res))
router.delete('/:id', (req, res) => controller.delete(req, res))

export default router
