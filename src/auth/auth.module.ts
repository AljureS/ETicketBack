import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/user/user.repository';
import { UserModule } from 'src/user/user.module';
import { EmailService } from 'src/email/email.service';
import { PassportModule } from '@nestjs/passport';
// import { Auth0Strategy } from './auth0.strategy';
import { JwtModule } from '@nestjs/jwt';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.development' });

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // 'YOUR_JWT_SECRET',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, EmailService /*, Auth0Strategy*/],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(requiresAuth()).forRoutes('/auth/auth0'); //? PORFA NO ELIMNAR ESTA LINEA
  }
}
