import { Module } from '@nestjs/common';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { DiscountRepository } from './discount.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from 'src/entities/discount.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Discount])],
  controllers: [DiscountController],
  providers: [DiscountService, DiscountRepository]
})
export class DiscountModule {} 
