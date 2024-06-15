import { Module } from '@nestjs/common';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/entities/ticket.entity';
import { CloudinaryConfig } from 'src/config/cloudinary';
import { CloudinaryRepository } from './cloudinary.repository';
import { Event } from 'src/entities/event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Ticket]),
    // Importa EventsModule
  ],
  controllers: [CloudinaryController],
  providers: [CloudinaryService, CloudinaryConfig, CloudinaryRepository],
  exports: [CloudinaryRepository],
})
export class CloudinaryModule {}
