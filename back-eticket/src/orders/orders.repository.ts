import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "src/entities/order.entity";
import { OrderDetails } from "src/entities/orderDetails.entity";
import { User } from "src/entities/user.entity";
import { Event } from "src/entities/event.entity"; // Asegúrate de tener la entidad Event importada
import { Repository } from "typeorm";

@Injectable()
export class OrdersRepository {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        
        @InjectRepository(OrderDetails)
        private readonly orderDetailsRepository: Repository<OrderDetails>,
        
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>
    ) {}

    async addOrder() {
        return 'Endpoint para agregar orden'
    }

    getOrder(id: string) {
        const order = this.orderRepository.findOne({
            where: { id },
            relations: {
                orderDetails: {
                    events: true,
                },
            },
        });
        if (!order) {
            return 'Orden con id ${id} no encontrada';
        }

        return order;
    }


    async getAllOrder() {
        await this.orderRepository.find({
            relations:['orderDetails']
        });
    }
}
