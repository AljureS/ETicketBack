import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
    constructor(private orderRepository: OrdersRepository) {}

    addOrder(){
        return this.orderRepository.addOrder();
    }

    getOrder(id: string){
        return this.orderRepository.getOrder(id);
    }

    getAllOrder(){
        return this.orderRepository.getAllOrder()
    }
}
