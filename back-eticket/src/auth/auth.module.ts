import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/user/user.repository';
import { UserModule } from 'src/user/user.module';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UserModule], 
  controllers: [AuthController],
  providers: [AuthService, UserRepository, EmailService],
  exports: [AuthService],
})
export class AuthModule {}
