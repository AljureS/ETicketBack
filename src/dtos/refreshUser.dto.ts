import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RefreshUserDto {
  @IsNotEmpty({ message: 'Token required' })
  @IsString({ message: 'token must be a string' })
  token: string;

  @IsNotEmpty({ message: 'Email required' })
  @IsString({ message: 'email must be a string' })
  @IsEmail()
  email: string;
}
