import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';// Importa EntitiesModule
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { OrderDetails } from 'src/entities/orderDetails.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [
  TypeOrmModule.forFeature([Order]),
  TypeOrmModule.forFeature([OrderDetails]),
  TypeOrmModule.forFeature([User]),
  TypeOrmModule.forFeature([Event]),
],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository]
})
export class OrdersModule {}
