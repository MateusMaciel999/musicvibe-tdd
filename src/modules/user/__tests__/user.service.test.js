// src/modules/user/__tests__/user.service.test.js
//
// TESTES UNITÁRIOS — UserService (Cadastro de Usuário)
// Ciclo TDD Red-Green-Refactor aplicado a cada cenário abaixo.
//
// Dependências reais são ISOLADAS por mocks (mockUserModel),
// garantindo que testamos APENAS a lógica de negócio do Service.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserService } from '../user.service.js'

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DO MODEL (simula o banco de dados — mesmo padrão do Shortz-App-TDD)
// ─────────────────────────────────────────────────────────────────────────────
const makeMockUserModel = (overrides = {}) => ({
  findOne: vi.fn().mockResolvedValue(null),
  findByPk: vi.fn().mockResolvedValue(null),
  findAll: vi.fn().mockResolvedValue([]),
  create: vi.fn().mockImplementation(async (data) => ({
    id: 1,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  ...overrides,
})

// ─────────────────────────────────────────────────────────────────────────────
// SUITE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
describe('UserService', () => {

  // ───────────────────────────────────────────────────────────────────────────
  // REGISTER — CADASTRO DE USUÁRIO
  // ───────────────────────────────────────────────────────────────────────────
  describe('register()', () => {

    /**
     * TESTE 1 — Cenário de Sucesso
     * RED:   Chamamos register() esperando retornar um objeto com name e email.
     *        O teste falha porque a função não existe.
     * GREEN: Implementamos register() que cria o usuário e retorna os dados
     *        sanitizados (sem a senha).
     * REFACTOR: Extraímos _sanitize() e _isValidEmail() como helpers privados.
     *
     * Verifica: retorno correto ao cadastrar com dados válidos.
     */
    it('deve cadastrar um usuário com dados válidos e retornar dados sem a senha', async () => {
      const mockModel = makeMockUserModel()
      const service = new UserService(mockModel)

      const result = await service.register({
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123',
      })

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('name', 'João Silva')
      expect(result).toHaveProperty('email', 'joao@example.com')
      expect(result).not.toHaveProperty('password')
    })

    /**
     * TESTE 2 — Validação: Nome muito curto
     * RED:   Esperamos que a função lance erro quando nome < 2 chars.
     *        Sem validação → sem erro → teste falha.
     * GREEN: Adicionamos guard `if (!name || name.trim().length < 2)`.
     *
     * Verifica: lançamento de erro com mensagem correta para nome inválido.
     */
    it('deve lançar erro se o nome tiver menos de 2 caracteres', async () => {
      const mockModel = makeMockUserModel()
      const service = new UserService(mockModel)

      await expect(
        service.register({ name: 'A', email: 'a@mail.com', password: 'senha123' })
      ).rejects.toThrow('O nome deve ter pelo menos 2 caracteres.')
    })

    /**
     * TESTE 3 — Validação: E-mail inválido
     * RED:   Esperamos que e-mail "não-é-um-email" cause erro.
     *        Sem regex de validação → passa sem erro → teste falha.
     * GREEN: Adicionamos _isValidEmail() e guard correspondente.
     *
     * Verifica: rejeição de e-mail com formato inválido.
     */
    it('deve lançar erro se o e-mail for inválido', async () => {
      const mockModel = makeMockUserModel()
      const service = new UserService(mockModel)

      await expect(
        service.register({ name: 'Maria', email: 'nao-e-email', password: 'senha123' })
      ).rejects.toThrow('O e-mail fornecido é inválido.')
    })

    /**
     * TESTE 4 — Validação: Senha fraca
     * RED:   Esperamos erro quando senha tem < 6 chars.
     *        Sem validação de tamanho → teste falha.
     * GREEN: Adicionamos guard `if (!password || password.length < 6)`.
     *
     * Verifica: rejeição de senha com menos de 6 caracteres.
     */
    it('deve lançar erro se a senha tiver menos de 6 caracteres', async () => {
      const mockModel = makeMockUserModel()
      const service = new UserService(mockModel)

      await expect(
        service.register({ name: 'Carlos', email: 'carlos@mail.com', password: '123' })
      ).rejects.toThrow('A senha deve ter pelo menos 6 caracteres.')
    })

    /**
     * TESTE 5 — Regra de Negócio: E-mail duplicado
     * RED:   Esperamos erro quando e-mail já existe no banco.
     *        Sem checagem de duplicação → usuário duplicado → teste falha.
     * GREEN: Adicionamos findOne() e lançamos erro se retornar resultado.
     *
     * Verifica: prevenção de cadastro com e-mail já existente.
     */
    it('deve lançar erro se o e-mail já estiver cadastrado', async () => {
      const existingUser = { id: 99, email: 'duplicado@mail.com' }
      const mockModel = makeMockUserModel({
        findOne: vi.fn().mockResolvedValue(existingUser),
      })
      const service = new UserService(mockModel)

      await expect(
        service.register({ name: 'Ana', email: 'duplicado@mail.com', password: 'senha123' })
      ).rejects.toThrow('Este e-mail já está cadastrado.')
    })

    /**
     * TESTE 6 — Hash de Senha
     * RED:   Verificamos que model.create() NÃO é chamado com a senha em texto puro.
     *        Sem hash → create() recebe 'senha123' → expect falha.
     * GREEN: Adicionamos bcrypt.hash() antes de chamar create().
     *
     * Verifica: a senha nunca é salva em texto puro no banco.
     */
    it('não deve salvar a senha em texto puro no banco de dados', async () => {
      const mockModel = makeMockUserModel()
      const service = new UserService(mockModel)

      await service.register({ name: 'Bia', email: 'bia@mail.com', password: 'senha123' })

      const callArgs = mockModel.create.mock.calls[0][0]
      expect(callArgs.password).not.toBe('senha123')
      expect(callArgs.password).toBe('hashed_password_mock')
    })

    /**
     * TESTE 7 — E-mail normalizado
     * RED:   Verificamos que e-mail é salvo em lowercase.
     *        Sem .toLowerCase() → e-mail maiúsculo salvo → teste falha.
     * GREEN: Adicionamos .toLowerCase().trim() ao e-mail antes de criar.
     *
     * Verifica: normalização do e-mail (lowercase) antes de persistir.
     */
    it('deve normalizar o e-mail para minúsculas antes de salvar', async () => {
      const mockModel = makeMockUserModel()
      const service = new UserService(mockModel)

      await service.register({ name: 'Davi', email: 'DAVI@MAIL.COM', password: 'senha123' })

      const callArgs = mockModel.create.mock.calls[0][0]
      expect(callArgs.email).toBe('davi@mail.com')
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // LOGIN — AUTENTICAÇÃO
  // ───────────────────────────────────────────────────────────────────────────
  describe('login()', () => {

    /**
     * TESTE 8 — Login com credenciais válidas
     * RED:   Esperamos que login() retorne o usuário sanitizado.
     *        Sem implementação → undefined → teste falha.
     * GREEN: Implementamos findOne() + bcrypt.compare() + _sanitize().
     *
     * Verifica: retorno correto ao autenticar com e-mail e senha válidos.
     */
    it('deve autenticar o usuário e retornar dados sem a senha', async () => {
      const storedUser = {
        id: 1,
        name: 'Eve',
        email: 'eve@mail.com',
        password: 'hashed_password_mock',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const mockModel = makeMockUserModel({
        findOne: vi.fn().mockResolvedValue(storedUser),
      })
      const service = new UserService(mockModel)

      const result = await service.login({ email: 'eve@mail.com', password: 'senha123' })

      expect(result).toHaveProperty('id', 1)
      expect(result).toHaveProperty('name', 'Eve')
      expect(result).not.toHaveProperty('password')
    })

    /**
     * TESTE 9 — Login com e-mail inexistente
     * RED:   Esperamos erro genérico "Credenciais inválidas" (não expõe qual campo errou).
     *        Sem checagem → erro diferente ou sem erro → teste falha.
     * GREEN: Adicionamos `if (!user) throw new Error('Credenciais inválidas.')`.
     *
     * Verifica: mensagem genérica para não expor quais dados existem no sistema.
     */
    it('deve lançar erro genérico se o e-mail não existir', async () => {
      const mockModel = makeMockUserModel({
        findOne: vi.fn().mockResolvedValue(null),
      })
      const service = new UserService(mockModel)

      await expect(
        service.login({ email: 'inexistente@mail.com', password: 'qualquer' })
      ).rejects.toThrow('Credenciais inválidas.')
    })

    /**
     * TESTE 10 — Login com senha errada
     * RED:   Mock do bcrypt.compare retorna false → esperamos erro.
     *        Sem checagem da senha → sucesso indevido → teste falha.
     * GREEN: Adicionamos `if (!passwordMatch) throw new Error('Credenciais inválidas.')`.
     *
     * Verifica: rejeição quando senha não bate com o hash armazenado.
     */
    it('deve lançar erro se a senha estiver incorreta', async () => {
      const storedUser = { id: 2, email: 'foo@mail.com', password: 'hashed_password_mock' }
      const mockModel = makeMockUserModel({
        findOne: vi.fn().mockResolvedValue(storedUser),
      })
      // Override do mock global de bcrypt para retornar false neste teste
      const bcrypt = await import('bcryptjs')
      bcrypt.default.compare.mockResolvedValueOnce(false)

      const service = new UserService(mockModel)

      await expect(
        service.login({ email: 'foo@mail.com', password: 'senhaErrada' })
      ).rejects.toThrow('Credenciais inválidas.')
    })

    /**
     * TESTE 11 — Login sem campos obrigatórios
     * RED:   Chamamos login sem e-mail → esperamos erro de validação.
     *        Sem guard inicial → findOne() com undefined → comportamento imprevisível.
     * GREEN: Adicionamos guard `if (!email || !password)`.
     *
     * Verifica: validação dos campos obrigatórios antes de consultar o banco.
     */
    it('deve lançar erro se e-mail ou senha forem omitidos', async () => {
      const mockModel = makeMockUserModel()
      const service = new UserService(mockModel)

      await expect(
        service.login({ email: '', password: '' })
      ).rejects.toThrow('E-mail e senha são obrigatórios.')
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // FIND BY ID — BUSCA POR ID
  // ───────────────────────────────────────────────────────────────────────────
  describe('findById()', () => {

    /**
     * TESTE 12 — Busca por ID existente
     * RED:   Esperamos o usuário sanitizado com o ID 5.
     *        Sem implementação → undefined → falha.
     * GREEN: Implementamos findByPk() + _sanitize().
     *
     * Verifica: retorno correto ao buscar usuário por ID válido.
     */
    it('deve retornar o usuário pelo ID correto', async () => {
      const foundUser = {
        id: 5, name: 'Fernanda', email: 'fe@mail.com',
        role: 'user', createdAt: new Date(), updatedAt: new Date(),
      }
      const mockModel = makeMockUserModel({
        findByPk: vi.fn().mockResolvedValue(foundUser),
      })
      const service = new UserService(mockModel)

      const result = await service.findById(5)

      expect(result).toHaveProperty('id', 5)
      expect(result).toHaveProperty('name', 'Fernanda')
    })

    /**
     * TESTE 13 — ID não encontrado
     * RED:   Esperamos erro "Usuário não encontrado."
     *        Sem guard → retorna undefined → teste falha.
     * GREEN: Adicionamos `if (!user) throw new Error(...)`.
     *
     * Verifica: erro correto ao buscar ID inexistente.
     */
    it('deve lançar erro se o ID não existir no banco', async () => {
      const mockModel = makeMockUserModel({
        findByPk: vi.fn().mockResolvedValue(null),
      })
      const service = new UserService(mockModel)

      await expect(service.findById(999)).rejects.toThrow('Usuário não encontrado.')
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // FIND ALL — LISTAR USUÁRIOS
  // ───────────────────────────────────────────────────────────────────────────
  describe('findAll()', () => {

    /**
     * TESTE 14 — Listar todos os usuários
     * RED:   Esperamos array de objetos sem senha.
     *        Sem implementação → array vazio ou com senha → falha.
     * GREEN: Implementamos findAll() + map(_sanitize).
     *
     * Verifica: retorno de lista de usuários, sem expor as senhas.
     */
    it('deve retornar todos os usuários sem expor as senhas', async () => {
      const users = [
        { id: 1, name: 'A', email: 'a@m.com', role: 'user', password: 'hash1', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: 'B', email: 'b@m.com', role: 'admin', password: 'hash2', createdAt: new Date(), updatedAt: new Date() },
      ]
      const mockModel = makeMockUserModel({
        findAll: vi.fn().mockResolvedValue(users),
      })
      const service = new UserService(mockModel)

      const result = await service.findAll()

      expect(result).toHaveLength(2)
      expect(result[0]).not.toHaveProperty('password')
      expect(result[1]).not.toHaveProperty('password')
      expect(result[0]).toHaveProperty('role', 'user')
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // DELETE — REMOÇÃO DE USUÁRIO
  // ───────────────────────────────────────────────────────────────────────────
  describe('delete()', () => {

    /**
     * TESTE 15 — Deletar usuário existente
     * RED:   Esperamos objeto { message: 'Usuário removido com sucesso.' }.
     *        Sem implementação → undefined → teste falha.
     * GREEN: Implementamos destroy() com retorno de mensagem.
     *
     * Verifica: remoção bem-sucedida de um usuário existente.
     */
    it('deve remover o usuário e retornar mensagem de confirmação', async () => {
      const destroyFn = vi.fn().mockResolvedValue(undefined)
      const foundUser = { id: 10, destroy: destroyFn }
      const mockModel = makeMockUserModel({
        findByPk: vi.fn().mockResolvedValue(foundUser),
      })
      const service = new UserService(mockModel)

      const result = await service.delete(10)

      expect(destroyFn).toHaveBeenCalledOnce()
      expect(result).toHaveProperty('message', 'Usuário removido com sucesso.')
    })

    /**
     * TESTE 16 — Deletar ID inexistente
     * RED:   Esperamos erro ao tentar deletar usuário que não existe.
     *        Sem guard → crash ou comportamento inesperado → teste falha.
     * GREEN: Adicionamos `if (!user) throw new Error('Usuário não encontrado.')`.
     *
     * Verifica: erro correto ao tentar remover ID inválido.
     */
    it('deve lançar erro ao tentar deletar ID inexistente', async () => {
      const mockModel = makeMockUserModel({
        findByPk: vi.fn().mockResolvedValue(null),
      })
      const service = new UserService(mockModel)

      await expect(service.delete(999)).rejects.toThrow('Usuário não encontrado.')
    })
  })
})
