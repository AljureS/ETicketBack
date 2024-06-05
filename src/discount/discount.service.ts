import { Injectable } from '@nestjs/common';
import { DiscountRepository } from './discount.repository';
import { CreateDiscountDto } from 'src/dtos/discount.dto';

@Injectable()
export class DiscountService {
    constructor(
        private readonly discountRepository: DiscountRepository
    ) {}

    createDiscount (eventId, discount) {
        return this.discountRepository.createDiscount(eventId, discount);
    } 

    findByCode(code: string) {
        return this.discountRepository.findByCode(code);
    }
} 
