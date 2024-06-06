import { BadRequestException, Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from 'src/dtos/createOrder.dto'; // Importa el servicio de pagos
import { PaymentsRepository } from './mercadoPago.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from 'src/entities/ticket.entity';
import { Repository } from 'typeorm';
import { PaypalRepository } from './paypal.repository';

@Injectable()
export class OrdersService {
    constructor(
        private orderRepository: OrdersRepository,
        private paymentsRepository: PaymentsRepository,
        private paypalRepository:PaypalRepository,
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
                ticketInDB.stock -= ticket.quantity
                this.ticketRepository.save(ticketInDB)
            }
        }
        if(order.paymentMethod === 'mercadopago'){
            const preference = await this.paymentsRepository.createPreference(order);
        return preference; // Devuelve la preferencia al cliente para redirigirlo a MercadoPago
        }
        if(order.paymentMethod === 'paypal'){
            return await this.paypalRepository.createPayment(order)
        }else{
            throw new BadRequestException("No se especificó un metodo de pago")
        }
        
    }

    async executePayment(token:string) {
        return await this.paypalRepository.executePayment(token);
    }

    getOrder(id: string) {
        return this.orderRepository.getOrder(id);
    }

    getAllOrder() {
        return this.orderRepository.getAllOrder();
    }
}
