// src/modules/user/user.router.js
import { Router } from 'express'
import User from './user.model.js'
import UserService from './user.service.js'
import { UserController } from './user.controller.js'

const router = Router()
const service = new UserService(User)
const controller = new UserController(service)

router.post('/register', (req, res) => controller.register(req, res))
router.post('/login', (req, res) => controller.login(req, res))
router.get('/', (req, res) => controller.getAll(req, res))
router.get('/:id', (req, res) => controller.getById(req, res))
router.put('/:id', (req, res) => controller.update(req, res))
router.delete('/:id', (req, res) => controller.delete(req, res))

export default router
