import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { OrderDetails } from 'src/entities/orderDetails.entity';
import { User } from 'src/entities/user.entity';
import { Event } from 'src/entities/event.entity'; // Asegúrate de tener la entidad Event importada
import { Repository } from 'typeorm';
import { CreateOrderDto } from 'src/dtos/createOrder.dto';
import { Ticket } from 'src/entities/ticket.entity';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderDetails)
    private readonly orderDetailsRepository: Repository<OrderDetails>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,

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
    let total = 0;
    const listaDeTicketsEnDB = await this.ticketRepository.find();
    order.tickets.forEach((ticket) => {

      const ticketBuscado = listaDeTicketsEnDB.find(
        (ticketEnDB) => ticketEnDB.id === ticket.id
      );

      if (ticketBuscado) {
        if(ticketBuscado.stock < ticket.quantity){
          throw new BadRequestException("El ticket tiene stock insuficiente")
        }
        ticketBuscado.stock -= ticket.quantity;
        
        total += Number(ticketBuscado.price * ticket.quantity);
        this.descontarStock(ticketBuscado);
        for(const tic of tickets){
          if(ticketBuscado.id === tic.id) throw new BadRequestException("No se puede mandar dos veces el mismo ticket")
        }
        tickets.push(ticketBuscado);
      }else{
        throw new BadRequestException("No existe ese tipo de ticket")
      }
    });
    const detalleDeCompra = new OrderDetails();
    detalleDeCompra.order = newOrderInDB;
    
    detalleDeCompra.price = total;
    const detalleDeCompraInDb = await this.orderDetailsRepository.save(detalleDeCompra);

    return {
      ordenDecompra: newOrderInDB,
      PrecioTotal: detalleDeCompraInDb.price,
      IdDetalleDeCompra: detalleDeCompraInDb.id,
    };
  }

  async descontarStock(ticket:Ticket) {
    await this.ticketRepository.save(ticket);
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
