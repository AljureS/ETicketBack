import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/dtos/login.dto';
import { createUserDto } from 'src/dtos/user.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/user/role.enum';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/roles/roles.guard';
import { ApiTags } from '@nestjs/swagger';
import { EmailInterceptor } from 'src/interceptors/emailAMinuscula';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor (private readonly authService: AuthService){}

    // [url]/auth/signup 
    
  @UseInterceptors(EmailInterceptor)
    @Post('signup') 
    signUp(@Body() user: createUserDto) {
        return this.authService.signUp(user);
    }


    @Post('login')
    logIn(@Body() credentials: LoginUserDto) {
        return this.authService.logIn(credentials);
    }

    @Roles(Role.SUPERADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @Put('update/:id')
    updateRole(@Param('id',ParseUUIDPipe) id: string){
        return this.authService.updateRole( id)
    }
    @Get('confirm')
    async confirm(@Query('token') token: string) {
    return await this.authService.confirmEmail(token);
  }
}
