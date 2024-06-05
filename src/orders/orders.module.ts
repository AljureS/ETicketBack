import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';// Importa EntitiesModule
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { OrderDetails } from 'src/entities/orderDetails.entity';
import { User } from 'src/entities/user.entity';
import { Ticket } from 'src/entities/ticket.entity';
import { EmailService } from 'src/email/email.service';
import { TicketVendido } from 'src/entities/ticketVendido.entity';
import { PaymentsRepository } from './payments.repository';

@Module({
  imports: [
  TypeOrmModule.forFeature([Order]),
  TypeOrmModule.forFeature([OrderDetails]),
  TypeOrmModule.forFeature([User]),
  TypeOrmModule.forFeature([Event]),
  TypeOrmModule.forFeature([Ticket]),
  TypeOrmModule.forFeature([TicketVendido]),
],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository,PaymentsRepository,EmailService]
})
export class OrdersModule {}
