import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthTokenService } from '../auth/auth-token.service';
import { Role } from '../common/role.enum';
import { UserStatus } from '../common/user-status.enum';
import { UsersRepository } from '../users/users.repository';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly reflector: Reflector,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: { id: number; role: Role; tokenVersion: number };
    }>();

    const authorization = request.headers.authorization;
    if (
      typeof authorization === 'string' &&
      authorization.startsWith('Bearer ')
    ) {
      const token = authorization.slice(7).trim();
      const payload = this.authTokenService.verify(token);
      const user = await this.usersRepository.findById(payload.sub);

      if (!user || user.status !== UserStatus.Active) {
        throw new UnauthorizedException('Active user not found');
      }

      if (payload.tokenVersion !== user.tokenVersion) {
        throw new UnauthorizedException('Token was invalidated');
      }

      request.user = {
        id: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      };

      return true;
    }

    const header = request.headers['x-user-id'];
    const parsed =
      typeof header === 'string' ? Number.parseInt(header, 10) : Number.NaN;

    if (Number.isNaN(parsed)) {
      throw new UnauthorizedException('x-user-id header is required');
    }

    const user = await this.usersRepository.findById(parsed);
    if (!user || user.status !== UserStatus.Active) {
      throw new UnauthorizedException('Active user not found');
    }

    request.user = {
      id: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    return true;
  }
}
