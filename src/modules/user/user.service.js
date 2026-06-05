// src/modules/user/user.service.js
import bcrypt from 'bcryptjs'

export class UserService {
  constructor(userModel) {
    this.userModel = userModel
  }

  // ────────────────────────────────────────────────
  // CADASTRO DE USUÁRIO
  // Regras:
  //   - Nome obrigatório (mín. 2 chars)
  //   - E-mail obrigatório e formato válido
  //   - Senha obrigatória (mín. 6 chars)
  //   - E-mail não pode já estar cadastrado
  //   - Senha é armazenada com hash bcrypt
  // ────────────────────────────────────────────────
  async register({ name, email, password }) {
    if (!name || name.trim().length < 2) {
      throw new Error('O nome deve ter pelo menos 2 caracteres.')
    }

    if (!email || !this._isValidEmail(email)) {
      throw new Error('O e-mail fornecido é inválido.')
    }

    if (!password || password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres.')
    }

    const existing = await this.userModel.findOne({ where: { email } })
    if (existing) {
      throw new Error('Este e-mail já está cadastrado.')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await this.userModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
    })

    return this._sanitize(user)
  }

  // ────────────────────────────────────────────────
  // LOGIN / AUTENTICAÇÃO
  // Regras:
  //   - Deve existir usuário com o e-mail fornecido
  //   - Senha deve bater com o hash armazenado
  // ────────────────────────────────────────────────
  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios.')
    }

    const user = await this.userModel.findOne({ where: { email: email.toLowerCase().trim() } })
    if (!user) {
      throw new Error('Credenciais inválidas.')
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      throw new Error('Credenciais inválidas.')
    }

    return this._sanitize(user)
  }

  // ────────────────────────────────────────────────
  // BUSCAR USUÁRIO POR ID
  // ────────────────────────────────────────────────
  async findById(id) {
    if (!id) {
      throw new Error('ID é obrigatório.')
    }

    const user = await this.userModel.findByPk(id)
    if (!user) {
      throw new Error('Usuário não encontrado.')
    }

    return this._sanitize(user)
  }

  // ────────────────────────────────────────────────
  // LISTAR TODOS (admin)
  // ────────────────────────────────────────────────
  async findAll() {
    const users = await this.userModel.findAll()
    return users.map(u => this._sanitize(u))
  }

  // ────────────────────────────────────────────────
  // ATUALIZAR PERFIL
  // Regras:
  //   - Não permite alterar e-mail para um já existente
  //   - Se nova senha fornecida, deve ter mín. 6 chars
  // ────────────────────────────────────────────────
  async update(id, { name, email, password }) {
    const user = await this.userModel.findByPk(id)
    if (!user) {
      throw new Error('Usuário não encontrado.')
    }

    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        throw new Error('O nome deve ter pelo menos 2 caracteres.')
      }
      user.name = name.trim()
    }

    if (email !== undefined) {
      if (!this._isValidEmail(email)) {
        throw new Error('O e-mail fornecido é inválido.')
      }
      const existing = await this.userModel.findOne({ where: { email } })
      if (existing && existing.id !== id) {
        throw new Error('Este e-mail já está em uso.')
      }
      user.email = email.toLowerCase().trim()
    }

    if (password !== undefined) {
      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.')
      }
      user.password = await bcrypt.hash(password, 10)
    }

    await user.save()
    return this._sanitize(user)
  }

  // ────────────────────────────────────────────────
  // DELETAR USUÁRIO
  // ────────────────────────────────────────────────
  async delete(id) {
    const user = await this.userModel.findByPk(id)
    if (!user) {
      throw new Error('Usuário não encontrado.')
    }
    await user.destroy()
    return { message: 'Usuário removido com sucesso.' }
  }

  // ────────────────────────────────────────────────
  // HELPERS PRIVADOS
  // ────────────────────────────────────────────────
  _isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  _sanitize(user) {
    const { id, name, email, role, createdAt, updatedAt } = user
    return { id, name, email, role, createdAt, updatedAt }
  }
}

export default UserService
