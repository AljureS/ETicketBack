import { Module } from '@nestjs/common';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { DiscountRepository } from './discount.repository';

@Module({
  controllers: [DiscountController],
  providers: [DiscountService, DiscountRepository]
})
export class DiscountModule {}
