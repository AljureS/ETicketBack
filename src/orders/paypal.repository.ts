import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from 'src/dtos/createOrder.dto';
import axios from 'axios';
import { OrdersRepository } from './orders.repository';
@Injectable()
export class PaypalRepository {
  private auth = {
    username: process.env.PAYPAL_CLIENT,
    password: process.env.PAYPAL_SECRET,
  };
  constructor(private readonly orderRepository: OrdersRepository) {}
  async createPayment(order: CreateOrderDto) {
    const body = {
      intent: 'CAPTURE',
      purchase_units: order.tickets.map((ticket) => {
        return {
          amount: {
            currency_code: 'USD',
            value: String(ticket.price * ticket.quantity),
          },
        };
      }),
      //   [
      //     {
      //       amount: {
      //         currency_code: 'USD', //https://developer.paypal.com/docs/api/reference/currency-codes/
      //         value: '115',
      //       },
      //     },
      //   ],
      application_context: {
        brand_name: `Raioticket`,
        landing_page: 'NO_PREFERENCE', // Default, para mas informacion https://developer.paypal.com/docs/api/orders/v2/#definition-order_application_context
        user_action: 'PAY_NOW', // Accion para que en paypal muestre el monto del pago
        return_url: `http://localhost:3001/orders/execute`, // Url despues de realizar el pago
        cancel_url: `https://front-radio-ticket.vercel.app/`, // Url despues de realizar el pago
      },
    };
    //https://api-m.sandbox.paypal.com/v2/checkout/orders [POST]

    const config = {
      auth: this.auth,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Envía la solicitud POST usando axios
    try {
      const response = await axios.post(
        `${process.env.PAYPAL_API}/v2/checkout/orders`,
        body,
        config,
      );
      await this.orderRepository.addOrder(order);

      return response.data.links[1];
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      throw new Error('Error al crear la orden de pago en PayPal');
    }
  }
  async executePayment(token:string) {
    const config = {
      auth: this.auth,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    console.log(token);
    
    console.log('llegue a paypal repository execute payment');
    
    try {
      // Envía la solicitud GET usando axios para capturar el pago
      const response = await axios.post(
        `${process.env.PAYPAL_API}/v2/checkout/orders/${token}/capture`,{},
        config,
      );
      // Responde con los datos del cuerpo de la respuesta de PayPal
      return "Pago completado con exito";
    } catch (error) {
      // Maneja errores y responde con el mensaje de error
      console.error(error.response ? error.response.data : error.message);
      throw new BadRequestException(`${error}`);
    }
  }
}
