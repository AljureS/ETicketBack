import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from 'src/dtos/createOrder.dto';

@Injectable()
export class OrdersService {
    constructor(private orderRepository: OrdersRepository) {}

    addOrder(order:CreateOrderDto){
        return this.orderRepository.addOrder(order);
    }

    getOrder(id: string){
        return this.orderRepository.getOrder(id);
    }

    getAllOrder(){
        return this.orderRepository.getAllOrder()
    }
}
