import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadGatewayException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class searchInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any>  {
    
    const {keyword} = context.switchToHttp().getRequest().query
    
    if(!keyword || typeof keyword !== 'string' ) return next
    .handle()
    .pipe(
      catchError(() => throwError(() => new BadGatewayException())),
    );

    const keywordMinuscula = keyword.toLowerCase()
    context.switchToHttp().getRequest().body.keyword = keywordMinuscula
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ms`)),
      );
  }
}