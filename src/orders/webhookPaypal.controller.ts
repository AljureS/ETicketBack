import { Controller, Post, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Controller('webhook')
export class WebhookController {
  constructor(
    @InjectRepository(User) 
        private readonly userRepository: Repository<User>
  ) {}

  @Post('paypal')
  async handlePayPalWebhook(@Req() req, @Res() res) {
    const event = req.body;

    try {
      switch (event.event_type) {
        case 'BILLING.SUBSCRIPTION.CREATED':
          // Lógica para manejar la creación de una suscripción
          await this.userRepository.update({email:event.resource.subscriber.email_address}, {isPremium:true});

          break;
        case 'BILLING.SUBSCRIPTION.CANCELLED':
          // Lógica para manejar la cancelación de una suscripción
          await this.userRepository.update({email:event.resource.subscriber.email_address}, {isPremium:false});
          break;
        case 'PAYMENT.SALE.COMPLETED':
          // Lógica para manejar un pago completado
          await this.userRepository.update({email:event.resource.subscriber.email_address}, {isPremium:true});

          break;
        case 'PAYMENT.SALE.DENIED':
          // Lógica para manejar un pago fallido
          await this.userRepository.update({email:event.resource.subscriber.email_address}, {isPremium:false});

          break;
        // Agrega más casos según los eventos que hayas configurado
        default:
          console.log(`Unhandled event type: ${event.event_type}`);
      }

      res.status(200).send('Event received');
    } catch (error) {
      console.error('Error handling PayPal webhook:', error);
      res.status(500).send('Error handling event');
    }
  }
}
