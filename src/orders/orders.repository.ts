import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { OrderDetails } from 'src/entities/orderDetails.entity';
import { User } from 'src/entities/user.entity';
import { Event } from 'src/entities/event.entity'; // Asegúrate de tener la entidad Event importada
import { Repository } from 'typeorm';
import { CreateOrderDto } from 'src/dtos/createOrder.dto';
import { Ticket } from 'src/entities/ticket.entity';
import { TicketVendido } from 'src/entities/ticketVendido.entity';
import { EmailService } from 'src/email/email.service';

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

    @InjectRepository(TicketVendido)
    private readonly ticketVendidoRepository: Repository<TicketVendido>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    private readonly emailService: EmailService,
  ) {}

  async addOrder(order: CreateOrderDto) {
    console.log(order);

    const user = await this.userRepository.findOne({
      where: { id: order.userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario No Encontrado');
    }

    const newOrder = new Order();
    newOrder.user = user;
    newOrder.date = new Date();
    const newOrderInDB = await this.orderRepository.save(newOrder);

    const ticketsParaEnviarPorMail: TicketVendido[] = [];
    let total = 0;
    const listaDeTicketsEnDB = await this.ticketRepository.find({
      relations: { event: true },
    });

    for (const ticket of order.tickets) {
      const ticketBuscado = listaDeTicketsEnDB.find(
        (ticketEnDB) => ticketEnDB.id === ticket.id,
      );

      if (ticketBuscado) {
        // Crea y guarda los tickets vendidos
        const nuevosTickets = await this.crearTicketsParaEnviarPorMail(
          ticketBuscado,
          ticket.quantity,
          order.userId,
        );
        ticketsParaEnviarPorMail.push(...nuevosTickets);

        total += Number(ticket.price * ticket.quantity);

        // Verifica si el ticket ya está en la lista
        if (
          ticketsParaEnviarPorMail.some((tic) => tic.id === ticketBuscado.id)
        ) {
          throw new BadRequestException(
            'No se puede mandar dos veces el mismo ticket',
          );
        }
      } else {
        throw new BadRequestException('No existe ese tipo de ticket');
      }
    }

    // Guarda los detalles de la compra
    const detalleDeCompra = new OrderDetails();
    detalleDeCompra.order = newOrderInDB;
    detalleDeCompra.price = total;
    await this.orderDetailsRepository.save(detalleDeCompra);

    // Envía los tickets por correo electrónico
    await this.emailService.sendTickets(user.email, ticketsParaEnviarPorMail);

    return 'Gracias por comprar en radioticket, por mail le llegaran los tickets que compró, revise el spam';
  }

  async descontarStock(ticket: Ticket) {
    await this.ticketRepository.save(ticket);
  }

  async crearTicketsParaEnviarPorMail(
    ticket: Ticket,
    quantity: number,
    userId,
  ): Promise<TicketVendido[]> {
    let tickets = [];
    for (let i = 0; i < quantity; i++) {
      const newTicketAVender = this.ticketVendidoRepository.create({
        event: ticket.event,
        zone: ticket.zone,
        isUsed: false,
        userId,
      });
      const ticketVendidoEnDB =
        await this.ticketVendidoRepository.save(newTicketAVender);
      tickets = [...tickets, ticketVendidoEnDB];
    }

    return tickets;
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

  async ofUser(userEmail) {
    const user = await this.userRepository.findOne({
      where: { email: userEmail },
    });
    const orderSearched = await this.ticketVendidoRepository.find({
      where: { userId: user.id },
      relations: { event: true },
    });
    return orderSearched;
  }

  async getAllOrder() {
    await this.orderRepository.find({
      relations: ['orderDetails'],
    });
  }
}
