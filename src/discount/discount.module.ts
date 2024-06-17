import { Module } from '@nestjs/common';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { DiscountRepository } from './discount.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from 'src/entities/discount.entity';
import { EmailService } from 'src/email/email.service';
import { User } from 'src/entities/user.entity';
import { Event } from 'src/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Discount,User,Event])],
  controllers: [DiscountController],
  providers: [DiscountService, DiscountRepository,EmailService],
})
export class DiscountModule {}
