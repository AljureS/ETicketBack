import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { OrderDetails } from 'src/entities/orderDetails.entity';
import { User } from 'src/entities/user.entity';
import { Event } from 'src/entities/event.entity'; // Asegúrate de tener la entidad Event importada
import { Repository } from 'typeorm';
import { CreateOrderDto } from 'src/dtos/createOrder.dto';

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
    private readonly eventRepository: Repository<Event>,
  ) {}

  async addOrder(order: CreateOrderDto) {
    const user = await this.userRepository.findOne({
      where: { id: order.userId },
    });
    if(!user)new NotFoundException("Usuario No Encontrado")
    const newOrder = new Order();
    newOrder.user = user;
    newOrder.date = new Date();
    const newOrderInDB = await this.orderRepository.save(newOrder);

    const tickets = [];
    return 'order creada';
  }

  async getOrder(id: string) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: [
          'orderDetails',
          'orderDetails.event',
          'orderDetails.event.tickets',
        ],
      });

      if (!order) {
        return `Orden con id ${id} no encontrada`;
      }

      return order;
    } catch (error) {
      // Manejo de errores
      console.error('Error al obtener la orden:', error);
      throw error; // Puedes manejar el error según tu caso
    }
  }

  async getAllOrder() {
    await this.orderRepository.find({
      relations: ['orderDetails'],
    });
  }
}
