import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadGatewayException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class categoryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { category } = context.switchToHttp().getRequest().body;

    if (!category)
      return next
        .handle()
        .pipe(catchError(() => throwError(() => new BadGatewayException())));

    const categoryMinuscula = category.toUpperCase();
    context.switchToHttp().getRequest().body.category = categoryMinuscula;
    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
  }
}
