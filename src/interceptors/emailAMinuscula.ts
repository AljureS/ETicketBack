import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadGatewayException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class EmailInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any>  {
    
    const {email} = context.switchToHttp().getRequest().body
    
    if(!email) return next
    .handle()
    .pipe(
      catchError(() => throwError(() => new BadGatewayException())),
    );

    const emailMinuscula = email.toLowerCase()
    context.switchToHttp().getRequest().body.email = emailMinuscula
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}
