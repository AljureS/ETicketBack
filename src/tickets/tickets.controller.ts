import { Body, Controller, Get, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  getTickets() {
    return this.ticketsService.getAllTickets();
  }

  @Get(':id')
  getTicketById(@Param('id') id: string) {
    return this.ticketsService.getTicketById(id);
  }

  @Get('eventName')
  getTicketsByEventId(@Body('name') name: string) {
    return this.ticketsService.getTicketsByEventName(name);
  }
}
