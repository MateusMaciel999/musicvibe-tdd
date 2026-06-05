# RELATORIO.md — MusicVibe TDD

## 1. Funcionalidade Escolhida

**Cadastro e Autenticação de Usuários** (`UserService`)

Esta é a funcionalidade central da plataforma: sem ela nenhum fluxo de usuário funciona (criar playlists, favoritar músicas, deixar comentários, etc.). Ela engloba:

- Registro de novo usuário com validação de dados
- Login com verificação de credenciais
- Busca de usuário por ID
- Listagem de usuários (painel admin)
- Atualização de perfil
- Remoção de conta

---

## 2. Regras de Negócio

### 2.1 Registro (`register`)

| Regra | Comportamento |
|---|---|
| Nome obrigatório, mín. 2 caracteres | Lança `Error('O nome deve ter pelo menos 2 caracteres.')` |
| E-mail obrigatório e formato válido | Lança `Error('O e-mail fornecido é inválido.')` |
| Senha obrigatória, mín. 6 caracteres | Lança `Error('A senha deve ter pelo menos 6 caracteres.')` |
| E-mail único no sistema | Lança `Error('Este e-mail já está cadastrado.')` |
| Senha nunca salva em texto puro | Aplicado `bcrypt.hash()` com salt 10 antes de persistir |
| E-mail normalizado | Convertido para `lowercase` e `trim` antes de salvar |
| Retorno sem senha | `_sanitize()` remove o campo `password` do retorno |

### 2.2 Login (`login`)

| Regra | Comportamento |
|---|---|
| Campos obrigatórios | Lança `Error('E-mail e senha são obrigatórios.')` se algum estiver vazio |
| Usuário deve existir | Lança `Error('Credenciais inválidas.')` — mensagem genérica por segurança |
| Senha deve bater com hash | `bcrypt.compare()` — lança `Error('Credenciais inválidas.')` se falhar |

### 2.3 Demais operações

- **findById**: lança erro se ID não existir no banco
- **findAll**: retorna todos os usuários sem expor senhas
- **update**: valida cada campo alterado individualmente; impede e-mail duplicado
- **delete**: verifica existência antes de remover; confirma com mensagem

---

## 3. Como o TDD Foi Aplicado — Ciclo Red-Green-Refactor

O desenvolvimento seguiu estritamente o ciclo **Red → Green → Refactor** para cada teste.

### Passo a passo do fluxo aplicado

```
1. RED   — Escrevemos o teste descrevendo o comportamento esperado.
           O teste falha porque a funcionalidade não existe ainda.

2. GREEN — Escrevemos o mínimo de código necessário para o teste passar.
           Nenhuma otimização é feita aqui; só o suficiente para verde.

3. REFACTOR — Melhoramos o código sem quebrar os testes existentes.
              Extraímos helpers, eliminamos duplicação, melhoramos nomes.
```

### Exemplo do ciclo aplicado ao `register()`

**RED** — Escrevemos o teste 1 (`deve cadastrar com dados válidos`). Como `register()` não existia, o teste falhou com `TypeError`.

**GREEN** — Criamos `register()` no `UserService` com a assinatura mínima: receber dados, chamar `model.create()`, retornar o resultado. Teste passou.

**RED** — Escrevemos o teste 5 (`deve lançar erro se e-mail já cadastrado`). Falhou porque não havia checagem de duplicação.

**GREEN** — Adicionamos `findOne()` + `if (existing) throw new Error(...)`. Passou.

**REFACTOR** — Percebemos que a lógica de remoção da senha se repetia em `register`, `login` e `findById`. Extraímos `_sanitize()`. Todos os 16 testes continuaram passando.

---

## 4. Exemplos de Testes — Explicação Detalhada

### Teste 1: Cadastro com sucesso

```js
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
```

**O que verifica:**  
O caminho feliz do cadastro. Garante que, com dados válidos, o serviço retorna um objeto com `id`, `name` e `email`, e que a **senha nunca é exposta** na resposta — fundamental para segurança da API.

**Por que usar mock:**  
`mockModel.create` é um `vi.fn()` que retorna os dados diretamente, sem precisar de um banco de dados real. Isso torna o teste rápido, determinístico e isolado.

---

### Teste 5: E-mail duplicado (regra de negócio crítica)

```js
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
```

**O que verifica:**  
Que a regra de unicidade de e-mail é aplicada pela **camada de negócio** (Service), não apenas pelo banco de dados. O mock simula o banco retornando um usuário existente, e testamos que o Service rejeita o cadastro com a mensagem correta.

**Por que é importante:**  
Evita que a aplicação dependa exclusivamente da constraint do banco para garantir essa regra — o erro fica mais legível e controlado.

---

### Teste 10: Senha errada no login

```js
it('deve lançar erro se a senha estiver incorreta', async () => {
  const storedUser = { id: 2, email: 'foo@mail.com', password: 'hashed_password_mock' }
  const mockModel = makeMockUserModel({
    findOne: vi.fn().mockResolvedValue(storedUser),
  })
  const bcrypt = await import('bcryptjs')
  bcrypt.default.compare.mockResolvedValueOnce(false)

  const service = new UserService(mockModel)

  await expect(
    service.login({ email: 'foo@mail.com', password: 'senhaErrada' })
  ).rejects.toThrow('Credenciais inválidas.')
})
```

**O que verifica:**  
Que o sistema rejeita login quando a senha não bate com o hash armazenado. Usa `mockResolvedValueOnce(false)` para simular o `bcrypt.compare()` retornando falso neste teste específico. A mensagem é intencionalmente genérica ("Credenciais inválidas.") — não revela se o e-mail ou a senha estão errados, seguindo boas práticas de segurança.

---

## 5. Resultado dos Testes

```
 RUN  v2.1.9

 ✓ src/modules/user/__tests__/user.service.test.js (16 tests)

 Test Files  1 passed (1)
      Tests  16 passed (16)
   Duration  ~390ms
```

**16 testes unitários — todos passando.**

---

## 6. Estrutura do Projeto

```
musicvibe-tdd/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── vitest.setup.js          ← mocks globais (bcryptjs)
│   ├── database/
│   │   └── connection.js            ← Sequelize + SQLite
│   └── modules/
│       ├── user/
│       │   ├── __tests__/
│       │   │   └── user.service.test.js  ← 16 testes unitários
│       │   ├── user.model.js
│       │   ├── user.service.js      ← regras de negócio
│       │   ├── user.controller.js   ← camada HTTP
│       │   └── user.router.js       ← rotas Express
│       ├── track/
│       │   ├── track.model.js
│       │   ├── track.service.js
│       │   ├── track.controller.js
│       │   └── track.router.js
│       ├── playlist/
│       │   ├── playlist.model.js
│       │   ├── playlist.service.js
│       │   ├── playlist.controller.js
│       │   └── playlist.router.js
│       └── genre/
│           └── genre.model.js
├── package.json
├── vitest.config.js
└── RELATORIO.md
```

## 7. Ferramentas Utilizadas

| Ferramenta | Versão | Uso |
|---|---|---|
| Node.js | ESM (ES Modules) | Runtime |
| Express.js | ^4.19 | Framework web |
| Vitest | ^2.0 | Framework de testes |
| Sequelize | ^6.37 | ORM |
| SQLite3 | ^5.1 | Banco de dados |
| bcryptjs | ^2.4 | Hash de senhas |
| Supertest | ^7.0 | Testes de integração HTTP |
| vi.fn() | — | Mocking de funções |
| vi.mock() | — | Mocking de módulos |
| vi.spyOn() | — | Espionagem de chamadas |
