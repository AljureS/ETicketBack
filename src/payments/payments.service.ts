import { Injectable } from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';

@Injectable()
export class PaymentsService {
  constructor(private paymentsRepository: PaymentsRepository) {}

  createPreference() {
    return this.paymentsRepository.createPreference();
  }

  paymentSuccess() {
    return this.paymentsRepository.paymentSuccess();
  }
}
