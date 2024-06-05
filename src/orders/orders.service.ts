import { BadRequestException, Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from 'src/dtos/createOrder.dto'; // Importa el servicio de pagos
import { PaymentsRepository } from './payments.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from 'src/entities/ticket.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrdersService {
    constructor(
        private orderRepository: OrdersRepository,
        private paymentsRepository: PaymentsRepository,
        @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>, // Inyecta el servicio de pagos
    ) {}

    async addOrder(order: CreateOrderDto) {
        // Llama al servicio de pagos para crear una preferencia de pago
        console.log(order);
        for(const ticket of order.tickets){
            const ticketInDB = await this.ticketRepository.findOne({where:{id:ticket.id}})
            if(ticketInDB.stock < ticket.quantity){
                throw new BadRequestException("No Hay disponibles esa cantidad de tickets")
            }else{
                ticketInDB.stock -=1
                this.ticketRepository.save(ticketInDB)
            }
        }
        const preference = await this.paymentsRepository.createPreference(order);
        return preference; // Devuelve la preferencia al cliente para redirigirlo a MercadoPago
    }

    async processOrder(order: CreateOrderDto) {
        return this.orderRepository.addOrder(order);
    }

    getOrder(id: string) {
        return this.orderRepository.getOrder(id);
    }

    getAllOrder() {
        return this.orderRepository.getAllOrder();
    }
}
