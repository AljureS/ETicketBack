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
        notification_url: `https://radioticket.onrender.com/orders/notificar?order=${ordenIntermediaGuardada.id}`,
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
    let merchantOrderSearched;
    const { order } = query;
    const orderIntermedia = await this.tablaIntermediaOrderRepository.findOne({
      where: { id: order },
      relations: { tablaIntermediaTicket: true },
    });
    if (orderIntermedia.isUsed === true || orderIntermedia.isUsed === null) {
      return;
    }
    switch (query.topic) {
      case 'payment':
        const paymentId = query.id;

        const payment = await this.payment.get({ id: paymentId });
        merchantOrderSearched = await this.merchantOrder.get({
          merchantOrderId: payment.order.id,
        });
        break;
      case 'merchant_order':
        const orderId = query.id;
        merchantOrderSearched = await this.merchantOrder.get({
          merchantOrderId: orderId,
        });
        break;
      default:
        return;
    }
    
    const OrderAGuardar = {
      userId: orderIntermedia.user,
      paymentMethod: orderIntermedia.paymentMethod,
      tickets: orderIntermedia.tablaIntermediaTicket,
    };
    
    orderIntermedia.isUsed = true
    await this.tablaIntermediaOrderRepository.save(orderIntermedia)
    let paidAmount = 0;
    merchantOrderSearched.payments.forEach((payment) => {
      if (payment.status === 'approved') {
        paidAmount += payment.transaction_amount;
      }
    });
    if (paidAmount >= merchantOrderSearched.total_amount) {
      await this.orderRepository.addOrder(OrderAGuardar);
      for(const ticket of orderIntermedia.tablaIntermediaTicket){
        const ticketInDB = await this.ticketRepository.findOne({where:{id:ticket.id}})
        ticketInDB.stock -= ticket.quantity
        await this.ticketRepository.save(ticketInDB)
      }
      // Responde con los datos del cuerpo de la respuesta de PayPal
      return res.redirect(
        `${process.env.FRONT_URL}?success=true`,
      );
    }
  }
}
