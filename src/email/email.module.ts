import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // 'YOUR_JWT_SECRET',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
