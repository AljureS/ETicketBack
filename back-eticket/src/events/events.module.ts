import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsRepository } from './events.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/entities/event.entity';
import { Category } from 'src/entities/category.entity';
import { EventsController } from './events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Category])],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository],
  exports: [TypeOrmModule], // Exporta TypeOrmModule para que otros módulos puedan usar EventRepository
})
export class EventsModule {}
