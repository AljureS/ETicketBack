import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from 'src/dtos/createOrder.dto';
import axios from 'axios';
import { OrdersRepository } from './orders.repository';
import { createUserDto } from 'src/dtos/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Response } from 'express';
@Injectable()
export class PaypalRepository {
  private auth = {
    username: process.env.PAYPAL_CLIENT,
    password: process.env.PAYPAL_SECRET,
  };
  constructor(
    private readonly orderRepository: OrdersRepository,
    @InjectRepository(User) 
        private readonly userRepository: Repository<User>
    ) {}

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
      application_context: {
        brand_name: `Raioticket`,
        landing_page: 'NO_PREFERENCE', // Default, para mas informacion https://developer.paypal.com/docs/api/orders/v2/#definition-order_application_context
        user_action: 'PAY_NOW', // Accion para que en paypal muestre el monto del pago



        //aca cambie por la url deployada recordar cambiarla en produccion

        return_url: `https://radioticket.onrender.com/orders/execute`, // Url despues de realizar el pago
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
      throw new BadGatewayException('Error al crear la orden de pago en PayPal, El error que buscabamos');
    }
  }

  async executePayment(token:string,res:Response) {
    const config = {
      auth: this.auth,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    try {
      // Envía la solicitud GET usando axios para capturar el pago
      const response = await axios.post(
        `${process.env.PAYPAL_API}/v2/checkout/orders/${token}/capture`,{},
        config,
      );
      // Responde con los datos del cuerpo de la respuesta de PayPal
      return res.redirect("https://front-radio-ticket.vercel.app/?success=true")
    } catch (error) {
      // Maneja errores y responde con el mensaje de error
      console.error(error.response ? error.response.data : error.message);
      throw new BadRequestException(`${error}`);
    }
  }
  async createProduct() {
    const product = {
      name: 'Subscripcion Radioticket',
      description: "Subscripcion a eventos musicales se cobra mensualmente",
      type: 'SERVICE',
      category: 'SOFTWARE',
      image_url: 'https://avatars.githubusercontent.com/u/15802366?s=460&u=ac6cc646599f2ed6c4699a74b15192a29177f85a&v=4'
    };

    const config = {
      auth: this.auth,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await axios.post(
        `${process.env.PAYPAL_API}/v1/catalogs/products`,
        product,
        config
      );
      return response.data
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      throw new BadRequestException('Error al crear el producto en PayPal');
    }
  }

  async createPlan(product_id:string) {

    const plan = {
      name: 'PLAN mensual',
      product_id: product_id,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 12,
          pricing_scheme: {
            fixed_price: {
              value: "3", // PRECIO MENSUAL QUE COBRAS 3.30USD
              currency_code: "USD"
            }
          }
        }],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "10",
          currency_code: "USD"
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3
      },
      taxes: {
        percentage: "10", // 10USD + 10% = 11 USD
        inclusive: false
      }
    };

    const config = {
      auth: this.auth,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await axios.post(
        `${process.env.PAYPAL_API}/v1/billing/plans`,
        plan,
        config
      );
      return response.data
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      throw new BadRequestException('Error al crear el plan en PayPal');
    }
  }

  async generateSubscription(plan_id:string,user:Partial<createUserDto>) {
    const futureDate = new Date();
    futureDate.setMinutes(futureDate.getMinutes() + 5);

    // Convertir la fecha a formato ISO string
    const startTime = futureDate.toISOString();
    const subscription = {
      plan_id: plan_id, // P-3HK92642FR4448515MBQHCYQ
      start_time:startTime,
      quantity: 1,
      subscriber: {
        name: {
          given_name: user.name,
          surname: user.lastName
        },
        email_address: user.email,
      },
      return_url: 'http://localhost/orders/execute-subscription',
      cancel_url: 'http://localhost/orders/cancel-subscription'
    };

    const config = {
      auth: this.auth,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await axios.post(
        `${process.env.PAYPAL_API}/v1/billing/subscriptions`,
        subscription,
        config
      );
      console.log(response.data);
      
      await this.userRepository.update({email:user.email}, {isPremium:true});

      return response.data
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      throw new BadRequestException('Error al generar la suscripción en PayPal');
    }
  }

  async executeSubscription(req, res) {
    const token = req.query.token;

    const config = {
      auth: this.auth,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await axios.post(
        `${process.env.PAYPAL_API}/v1/billing/subscriptions/${token}/capture`,
        {},
        config
      );

      const subscriptionId = response.data.id;
        console.log('estoy en executeSubscription');
        
      // Actualiza el estado del usuario a premium en tu base de datos
      await this.userRepository.update(req.user.id, {isPremium:true});

      return { message: 'Suscripción completada con éxito', subscriptionId }
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      throw new BadRequestException('Error al ejecutar la suscripción en PayPal');
    }
  }

  async cancelSubscription(req, res) {
    // Lógica para manejar la cancelación de la suscripción
    return { message: 'La suscripción fue cancelada' }
  }
}
