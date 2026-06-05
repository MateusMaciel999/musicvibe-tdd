// src/config/vitest.setup.js
// Setup global de mocks e configurações para todos os testes

import { vi } from 'vitest'

// Mock global do bcryptjs para testes unitários
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password_mock'),
    compare: vi.fn().mockResolvedValue(true),
    hashSync: vi.fn().mockReturnValue('hashed_password_mock'),
    compareSync: vi.fn().mockReturnValue(true),
  },
}))
