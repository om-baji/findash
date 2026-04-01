import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '../common/role.enum';
import { CurrentUser } from '../shared/current-user.decorator';
import type { RequestUser } from '../shared/request-user.interface';
import { Roles } from '../shared/roles.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user account' })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login by email' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @Roles(Role.Viewer, Role.Analyst, Role.Admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout and invalidate current token version' })
  logout(@CurrentUser() user: RequestUser) {
    return this.authService.logout(user.id);
  }
}
