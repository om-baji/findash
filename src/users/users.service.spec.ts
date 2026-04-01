import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from '../common/role.enum';
import { UserStatus } from '../common/user-status.enum';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      incrementTokenVersion: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    service = new UsersService(repository);
  });

  it('creates a user when email does not exist', async () => {
    repository.findByEmail.mockResolvedValue(undefined);
    repository.create.mockResolvedValue({
      id: 2,
      name: 'Ana',
      email: 'ana@test.com',
      role: Role.Analyst,
      status: UserStatus.Active,
      tokenVersion: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const result = await service.create({
      name: 'Ana',
      email: 'ana@test.com',
      role: Role.Analyst,
    });

    expect(result.email).toBe('ana@test.com');
    expect(repository.create.mock.calls.length).toBe(1);
  });

  it('rejects duplicate email', async () => {
    repository.findByEmail.mockResolvedValue({
      id: 1,
      name: 'Existing',
      email: 'ana@test.com',
      role: Role.Admin,
      status: UserStatus.Active,
      tokenVersion: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    await expect(
      service.create({
        name: 'Ana',
        email: 'ana@test.com',
        role: Role.Analyst,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws not found on unknown user id', async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(service.findByIdOrFail(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
