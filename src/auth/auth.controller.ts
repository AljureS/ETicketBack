import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/dtos/login.dto';
import { createUserDto } from 'src/dtos/user.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/user/role.enum';
import { AuthGuards } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/roles/roles.guard';
import { ApiTags } from '@nestjs/swagger';
import { EmailInterceptor } from 'src/interceptors/emailAMinuscula';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { config as dotenvConfig } from 'dotenv';
import { RefreshUserDto } from 'src/dtos/refreshUser.dto';

dotenvConfig({ path: '.env.development' });

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  refreshtoken(@Body() currentUser: RefreshUserDto) {
    const { email, token } = currentUser;
    return this.authService.refreshtoken(email, token);
  }

  @Post('auth0')
  async redirectToAuth0Login(@Body() auth0: any) {
    const { given_name, family_name, email } = auth0;
    return this.authService.Auth0({
      name: given_name,
      lastName: family_name,
      email,
    });
  }

  @Post('forgotPassword')
  forgotPassword(@Body('email') email: any) {
    return this.authService.forgotPassword(email);
  }

  @Post('NewPassword')
  resetPassword(
    @Query('token') token: string, 
    @Body('newPassword') newPassword: string
  ) {
    return this.authService.resetPassword(token, newPassword);
  }

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
  updateRole(@Param('id', ParseUUIDPipe) id: string) {
    return this.authService.updateRole(id);
  }
  @Get('confirm')
  async confirm(@Query('token') token: string, @Res()res:Response) {
    await this.authService.confirmEmail(token);
    return res.redirect(`${process.env.FRONT_URL}/login`);
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
    res.redirect(
      `https://YOUR_AUTH0_DOMAIN/v2/logout?returnTo=${process.env.FRONT_URL}`,
    );
  }
}
