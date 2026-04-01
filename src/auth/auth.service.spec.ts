import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../common/role.enum';
import { UserStatus } from '../common/user-status.enum';
import { UsersRepository } from '../users/users.repository';
import { AuthTokenService } from './auth-token.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let tokenService: jest.Mocked<AuthTokenService>;

  beforeEach(() => {
    usersRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      incrementTokenVersion: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    tokenService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<AuthTokenService>;

    service = new AuthService(usersRepository, tokenService);
  });

  it('returns access token for active user', async () => {
    usersRepository.findByEmail.mockResolvedValue({
      id: 3,
      name: 'Nina',
      email: 'nina@test.com',
      role: Role.Analyst,
      status: UserStatus.Active,
      tokenVersion: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    tokenService.sign.mockReturnValue('signed-token');

    const result = await service.login({ email: 'nina@test.com' });

    expect(result.accessToken).toBe('signed-token');
  });

  it('creates viewer user on signup and returns token', async () => {
    usersRepository.findByEmail.mockResolvedValue(undefined);
    usersRepository.create.mockResolvedValue({
      id: 4,
      name: 'Sam',
      email: 'sam@test.com',
      role: Role.Viewer,
      status: UserStatus.Active,
      tokenVersion: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    tokenService.sign.mockReturnValue('signup-token');

    const result = await service.signup({ name: 'Sam', email: 'sam@test.com' });

    expect(result.accessToken).toBe('signup-token');
    expect(usersRepository.create.mock.calls[0]?.[0].role).toBe(Role.Viewer);
  });

  it('rejects inactive user login', async () => {
    usersRepository.findByEmail.mockResolvedValue({
      id: 3,
      name: 'Nina',
      email: 'nina@test.com',
      role: Role.Analyst,
      status: UserStatus.Inactive,
      tokenVersion: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    await expect(
      service.login({ email: 'nina@test.com' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
