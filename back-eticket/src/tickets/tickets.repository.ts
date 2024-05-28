import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostTicketDto } from 'src/dtos/PostTicket.dto';
import { Event } from 'src/entities/event.entity';
import { Ticket } from 'src/entities/ticket.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TicketsRepository {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async getAllTickets() {
    return await this.ticketRepository.find();
  }
  async getTicketById(id: string) {
    return await this.ticketRepository.findOne({ where: { id } });
  }
  async getTicketsByEventName(name:string){
    const evento = await this.eventRepository.findOne({where:{name}})
    if(!evento) throw new NotFoundException("No se encontró el evento en cuestion")
    return evento.tickets
  }
}
