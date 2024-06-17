import { Injectable } from '@nestjs/common';
import { DiscountRepository } from './discount.repository';

@Injectable()
export class DiscountService {
  constructor(private readonly discountRepository: DiscountRepository) {}

  createDiscount(eventId, discount) {
    return this.discountRepository.createDiscount(eventId, discount);
  }

  getDiscounts(eventId: string) {
    return this.discountRepository.getDiscounts(eventId);
  }

  findByCode(code: string) {
    return this.discountRepository.findByCode(code);
  }
}
