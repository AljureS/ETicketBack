import { Module } from '@nestjs/common';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/entities/ticket.entity';
import { CloudinaryConfig } from 'src/config/cloudinary';
import { CloudinaryRepository } from './cloudinary.repository';
import { EventsModule } from '../events/events.module'; // Asegúrate de importar EventsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    EventsModule, // Importa EventsModule
  ],
  controllers: [CloudinaryController],
  providers: [CloudinaryService, CloudinaryConfig, CloudinaryRepository],
})
export class CloudinaryModule {}
