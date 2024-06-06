import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';
import { CreateOrderDto } from 'src/dtos/createOrder.dto';
import { Ticket } from 'src/entities/ticket.entity';
import { Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class PaymentsRepository {
  private readonly client: MercadoPagoConfig;
  private readonly preference: Preference;
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly orderRepository:OrdersRepository
    
  ) {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: { timeout: 5000, idempotencyKey: 'abc' },
    });
    this.preference = new Preference(this.client);
  }

  async createPreference(order: CreateOrderDto) {
    try {
      const items = await Promise.all(order.tickets.map(async (ticket) => {
        const ticketInDB = await this.ticketRepository.findOne({ where: { id: ticket.id }, relations: { event: true } });
        return {
          id: ticket.id,
          title: `${ticketInDB.event.name}, zone: ${ticketInDB.zone}`,
          quantity: ticket.quantity,
          unit_price: Number(ticket.price),
        };
      }));

      const preferenceData = {
        items,
        back_urls: {
          success: 'https://front-radio-ticket.vercel.app/',
        },
        external_reference: JSON.stringify(order), // Guarda la orden para usarla después del pago
      };

      const preferenceResponse = await this.preference.create({
        body: preferenceData,
      });
      
      await this.orderRepository.addOrder(order)
      return preferenceResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async paymentSuccess() {
    return 'success';
  }
}
