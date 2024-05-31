import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/dtos/login.dto';
import { createUserDto } from 'src/dtos/user.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/user/role.enum';
import { AuthGuards} from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/roles/roles.guard';
import { ApiTags } from '@nestjs/swagger';
import { EmailInterceptor } from 'src/interceptors/emailAMinuscula';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor (private readonly authService: AuthService){}

    // [url]/auth/signup 
    @Get('/auth0')
    redirectToAuth0Login(@Req() req: Request) {
        const { given_name: name, family_name: lastName, email } = req.oidc.user
        this.authService.Auth0({ name, lastName, email });
        const userToken = JSON.stringify(req.oidc.accessToken);
        return userToken
    }

    // @Post('signup/auth0')
    // redirectToAuth0Signup(@Res() res: Response) {
    //     res.redirect('https://YOUR_AUTH0_DOMAIN/authorize?response_type=code&client_id=YOUR_AUTH0_CLIENT_ID&redirect_uri=http://localhost:3001/auth/callback&screen_hint=signup');
    // }
    
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
    @UseGuards(AuthGuards, RoleGuard)
    @Put('update/:id')
    updateRole(@Param('id',ParseUUIDPipe) id: string){
        return this.authService.updateRole( id)
    }
    @Get('confirm')
    async confirm(@Query('token') token: string) {
    return await this.authService.confirmEmail(token);
  }

    @Get('callback')
    @UseGuards(AuthGuard('auth0'))
    callback(@Req() req) {
        // El usuario ha sido autenticado, puedes devolver un JWT o manejar la sesión
        return req.user;
    }

    @Get('logout')
    logout(@Req() req, @Res() res: Response) {
        req.logout();
        res.redirect('https://YOUR_AUTH0_DOMAIN/v2/logout?returnTo=http://localhost:3000');
    }
}
