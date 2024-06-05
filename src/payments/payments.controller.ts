import { Controller, Get, Post, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async createPreference() {
    return this.paymentsService.createPreference();
  }

  @Get('/success')
  async paymentSucces() {
    return this.paymentsService.paymentSuccess();
  }
}
