import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MercadoPagoConfig,
  Payment,
  Preference,
  MerchantOrder,
} from 'mercadopago';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';
import { CreateOrderDto } from 'src/dtos/createOrder.dto';
import { Ticket } from 'src/entities/ticket.entity';
import { Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { TablaIntermediaOrder } from 'src/entities/tablaintermediaOrder.entity';
import { TablaIntermediaTicket } from 'src/entities/TablaIntermediaTicket.entity';
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-var-requires
@Injectable()
export class PaymentsRepository {
  private readonly client: MercadoPagoConfig;
  private readonly preference: Preference;
  private readonly payment: Payment;
  private readonly merchantOrder: MerchantOrder;

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly orderRepository: OrdersRepository,
    @InjectRepository(TablaIntermediaOrder)
    private readonly tablaIntermediaOrderRepository: Repository<TablaIntermediaOrder>,
    @InjectRepository(TablaIntermediaTicket)
    private readonly tablaIntermediaTicketRepository: Repository<TablaIntermediaTicket>,
  ) {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: { timeout: 5000, idempotencyKey: 'abc' },
    });
    this.preference = new Preference(this.client);
    this.payment = new Payment(this.client);
    this.merchantOrder = new MerchantOrder(this.client);
  }

  async createPreference(order: CreateOrderDto) {
    try {
      const valorDeDolar = await axios.get('https://dolarapi.com/v1/dolares/oficial')
      console.log(valorDeDolar.data.venta);
      
      order.tickets.forEach(ticket => {
        ticket.price = ticket.price * valorDeDolar.data.venta
      })
      const items = await Promise.all(
        order.tickets.map(async (ticket) => {
          const ticketInDB = await this.ticketRepository.findOne({
            where: { id: ticket.id },
            relations: { event: true },
          });
          return {
            id: ticket.id,
            title: `${ticketInDB.event.name}, zone: ${ticketInDB.zone}`,
            quantity: ticket.quantity,
            unit_price: Number(ticket.price),
          };
        }),
      );

      const orderIntermedia = this.tablaIntermediaOrderRepository.create({
        paymentMethod: order.paymentMethod,
        user: order.userId,
        tablaIntermediaTicket: [],
      });

      const ticketPromises = order.tickets.map(async (ticketIntermedio) => {
        const newTicketIntermedio = this.tablaIntermediaTicketRepository.create(
          {
            id: ticketIntermedio.id,
            price: ticketIntermedio.price,
            quantity: ticketIntermedio.quantity,
          },
        );


        await this.tablaIntermediaTicketRepository.save(newTicketIntermedio);
        orderIntermedia.tablaIntermediaTicket.push(newTicketIntermedio);
      });

      await Promise.all(ticketPromises);

      const ordenIntermediaGuardada =
        await this.tablaIntermediaOrderRepository.save(orderIntermedia);

      const preferenceData = {
        items,
        back_urls: {
          success: `${process.env.FRONT_URL}/`,
        },

        notification_url: `${process.env.BACK_URL}/orders/notificar?order=${ordenIntermediaGuardada.id}`,

      };

      const preferenceResponse = await this.preference.create({
        body: preferenceData,
      });

      return preferenceResponse;
    } catch (error) {
      console.error(error);
      throw new BadGatewayException('Error en mercadoPago');
    }
  }

  async notificar(query, res) {
    console.log('Inicio de notificar');
    let merchantOrderSearched;
    const { order } = query;
    console.log('query:', query);
    console.log('order:', order);

    const orderIntermedia = await this.tablaIntermediaOrderRepository.findOne({
        where: { id: order },
        relations: { tablaIntermediaTicket: true },
    });
    console.log('orderIntermedia:', orderIntermedia);

    if (orderIntermedia.isUsed === true || orderIntermedia.isUsed === null) {
        console.log('Order is already used or is null, returning.');
        return;
    }

    switch (query.topic) {
        case 'payment':
            const paymentId = query.id;
            console.log('Payment topic with paymentId:', paymentId);

            const payment = await this.payment.get({ id: paymentId });
            console.log('payment:', payment);

            merchantOrderSearched = await this.merchantOrder.get({
                merchantOrderId: payment.order.id,
            });
            console.log('merchantOrderSearched (payment):', merchantOrderSearched);
            break;
        case 'merchant_order':
            const orderId = query.id;
            console.log('Merchant_order topic with orderId:', orderId);

            merchantOrderSearched = await this.merchantOrder.get({
                merchantOrderId: orderId,
            });
            console.log('merchantOrderSearched (merchant_order):', merchantOrderSearched);
            break;
        default:
            console.log('Unknown topic, returning.');
            return;
    }

    const OrderAGuardar = {
        userId: orderIntermedia.user,
        paymentMethod: orderIntermedia.paymentMethod,
        tickets: orderIntermedia.tablaIntermediaTicket,
    };
    console.log('OrderAGuardar:', OrderAGuardar);

    orderIntermedia.isUsed = true;
    await this.tablaIntermediaOrderRepository.save(orderIntermedia);
    console.log('orderIntermedia marked as used and saved.');

    let paidAmount = 0;
    merchantOrderSearched.payments.forEach((payment) => {
        if (payment.status === 'approved') {
            paidAmount += payment.transaction_amount;
        }
        console.log('Processed payment:', payment);
    });
    console.log('Total paidAmount:', paidAmount);

    if (paidAmount >= merchantOrderSearched.total_amount) {
        console.log('Paid amount is sufficient, adding new order.');
        await this.orderRepository.addOrder(OrderAGuardar);

        for(const ticket of orderIntermedia.tablaIntermediaTicket){
            const ticketInDB = await this.ticketRepository.findOne({where:{id:ticket.id}});
            console.log('ticketInDB before update:', ticketInDB);
            
            ticketInDB.stock -= ticket.quantity;
            await this.ticketRepository.save(ticketInDB);
            console.log('ticketInDB after update:', ticketInDB);
        }

        console.log('Order and tickets updated successfully. Redirecting...');
        return res.redirect(`${process.env.FRONT_URL}?success=true`);
    } else {
        console.log('Paid amount is not sufficient.');
    }
}

}
