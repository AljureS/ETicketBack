import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/dtos/login.dto';
import { createUserDto } from 'src/dtos/user.dto';

@Controller('auth')
export class AuthController {
    constructor (private readonly authService: AuthService){}

    // [url]/auth/signup 
    @Post('signup')
    signUp(@Body() user: createUserDto) {
        return this.authService.signUp(user);
    }


    @Post('login')
    logIn(@Body() credentials: LoginUserDto) {
        return this.authService.logIn(credentials);
    }

    @Put('update/:id')
    updateRole(@Param('id') ParseUUIDPipe, id: string){
        return this.authService.updateRole( id)
    }
}
