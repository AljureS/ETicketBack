import { Injectable } from '@nestjs/common';
import { TicketsRepository } from './tickets.repository';

@Injectable()
export class TicketsService {
  constructor(private readonly ticketsRepository: TicketsRepository) {}
  getAllTickets() {
    return this.ticketsRepository.getAllTickets();
  }
  getTicketById(id: string) {
    return this.ticketsRepository.getTicketById(id);
  }
  getTicketsByEventName(name: string) {
    return this.ticketsRepository.getTicketsByEventName(name)
  }
}
