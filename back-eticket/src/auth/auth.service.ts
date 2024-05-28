import { Injectable } from '@nestjs/common';
import { LoginUserDto } from 'src/dtos/login.dto';

@Injectable()
export class AuthService {
    async signUp(user: any) {

        return "User created"
    }

    async logIn(credentials: LoginUserDto) {

        return "User logged in"
    }

    async updateRole(id: string) {

        return "User updated"
    }
}
