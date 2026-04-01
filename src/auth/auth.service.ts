import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '../common/role.enum';
import { UserStatus } from '../common/user-status.enum';
import { UsersRepository } from '../users/users.repository';
import { AuthTokenService } from './auth-token.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const now = new Date().toISOString();
    const user = await this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      role: Role.Viewer,
      status: UserStatus.Active,
      tokenVersion: 0,
      createdAt: now,
      updatedAt: now,
    });

    const accessToken = this.authTokenService.sign({
      sub: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user || user.status !== UserStatus.Active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.authTokenService.sign({
      sub: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(userId: number) {
    const user = await this.usersRepository.incrementTokenVersion(userId);

    if (!user) {
      throw new NotFoundException(`User ${userId} was not found`);
    }

    return {
      success: true,
      tokenVersion: user.tokenVersion,
    };
  }
}
