import { Role } from '../common/role.enum';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
  let service: AuthTokenService;

  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret';
    service = new AuthTokenService();
  });

  it('signs and verifies token payload', () => {
    const token = service.sign({
      sub: 10,
      role: Role.Analyst,
      tokenVersion: 2,
    });

    const payload = service.verify(token);

    expect(payload.sub).toBe(10);
    expect(payload.role).toBe(Role.Analyst);
    expect(payload.tokenVersion).toBe(2);
  });
});
