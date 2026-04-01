import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/role.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsEnum(Role)
  role!: Role;
}
