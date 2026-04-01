import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@finance.local' })
  @IsEmail()
  email!: string;
}
