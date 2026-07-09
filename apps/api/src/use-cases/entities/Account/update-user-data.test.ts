import { describe, expect, it, vi, beforeEach } from 'vitest'
import { UpdateUserDataUseCase } from './update-user-data'
import type { IUsersRepository } from '../../../repositories/users-repository'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    plan: { findUnique: vi.fn() },
    address: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

import { prisma } from '../../../lib/prisma'

describe('UpdateUserDataUseCase', () => {
  const repository = {
    findById: vi.fn(),
    findByIdWithAddress: vi.fn(),
    update: vi.fn(),
  } as unknown as IUsersRepository

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(repository.findById).mockResolvedValue({ id: 'user-1' } as never)
    vi.mocked(repository.update).mockResolvedValue({ id: 'user-1' } as never)
    vi.mocked(repository.findByIdWithAddress).mockResolvedValue({
      id: 'user-1',
      document: '12345678901',
    } as never)
  })

  it('persiste document (CPF) quando admin atualiza overview', async () => {
    const useCase = new UpdateUserDataUseCase(repository)

    const result = await useCase.execute({
      userId: 'user-1',
      document: '52998224725',
    })

    expect(repository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ document: '52998224725' }),
    )
    expect(result.user).toEqual(expect.objectContaining({ document: '12345678901' }))
  })

  it('permite limpar document com null', async () => {
    const useCase = new UpdateUserDataUseCase(repository)

    await useCase.execute({
      userId: 'user-1',
      document: null,
    })

    expect(repository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ document: null }),
    )
  })

  it('salva endereço textual em Address.foreign_address', async () => {
    const useCase = new UpdateUserDataUseCase(repository)

    await useCase.execute({
      userId: 'user-1',
      address: 'Rua A, 100, Centro',
    })

    expect(prisma.address.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        update: { foreign_address: 'Rua A, 100, Centro' },
      }),
    )
  })
})
