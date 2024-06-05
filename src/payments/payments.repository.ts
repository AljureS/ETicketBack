import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class PaymentsRepository {
  private readonly client: MercadoPagoConfig;
  private readonly preference: Preference;

  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: { timeout: 5000, idempotencyKey: 'abc' },
    });
    this.preference = new Preference(this.client);
  }

  async createPreference() {
    try {
      const preferenceData = {
        items: [
          {
            id: '1',
            category_id: 'REGGAETON',
            currency_id: '',
            description: 'A leading figure in reggaeton music globally.',
            title: 'Bad Bunny',
            quantity: 2,
            unit_price: 120,
          },
        ],
        back_urls: {
          success: 'http://localhost:3001/payments/succes',
        },
      };

      const preferenceResponse = await this.preference.create({
        body: preferenceData,
      });
      return preferenceResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async paymentSuccess() {
    return await 'succes';
  }
}
