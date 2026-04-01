import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'Nina Analyst' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'nina@finance.local' })
  @IsEmail()
  email!: string;
}
