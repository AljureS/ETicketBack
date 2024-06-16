import { IsString } from 'class-validator';

export class Auth0LoginDto {
  @IsString()
  accessToken: string;
}
