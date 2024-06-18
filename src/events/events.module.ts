import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsRepository } from './events.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/entities/event.entity';
import { Category } from 'src/entities/category.entity';
import { EventsController } from './events.controller';
import { Ticket } from 'src/entities/ticket.entity';
import { CloudinaryRepository } from 'src/cloudinary/cloudinary.repository';
import { EmailService } from 'src/email/email.service';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Category, Ticket,User])],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository, CloudinaryRepository,EmailService],
  exports: [TypeOrmModule], // Exporta TypeOrmModule para que otros módulos puedan usar EventRepository
})
export class EventsModule {}
