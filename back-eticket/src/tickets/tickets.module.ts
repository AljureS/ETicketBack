import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/entities/ticket.entity';
import { Event } from 'src/entities/event.entity';
import { TicketsRepository } from './tickets.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Ticket])],
  providers: [TicketsService, TicketsRepository],
  controllers: [TicketsController]
})
export class TicketsModule {}
