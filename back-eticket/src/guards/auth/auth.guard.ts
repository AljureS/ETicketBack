import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Role } from '../../user/role.enum';

@Injectable()
export class AuthGuards implements CanActivate { // le puse una "s" a AuthGuard
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext,): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1] ?? '';
    if (!token) throw new UnauthorizedException('Bearer token not found');
    try {
      const secret = process.env.JWT_SECRET;
      const user = this.jwtService.verify(token, { secret });
      user.exp = new Date(user.exp * 1000)
      user.iat = new Date(user.iat * 1000)
      user.roles = user.isAdmin ? [Role.ADMIN]: [Role.USER]
      user.roles = user.isSuperAdmin ? [...user.roles, Role.SUPERADMIN]: [...user.roles]
      request.user = user;
      
      return true;  
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}