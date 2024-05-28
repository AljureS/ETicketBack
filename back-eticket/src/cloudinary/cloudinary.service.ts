import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryRepository } from './cloudinary.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from 'src/entities/event.entity';

@Injectable()
export class CloudinaryService {
    constructor(
        private readonly cloudinaryRepository: CloudinaryRepository,
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
    ) {}

    async uploadImage(file: Express.Multer.File, eventId: string) {
        const event = await this.eventRepository.findOneBy({ id: eventId });
        if (!event) {
            throw new NotFoundException(`Event with ID ${eventId} not found.`);
        }
        const response = await this.cloudinaryRepository.uploadImage(file);
        await this.eventRepository.update({ id: eventId }, {
            imgUrl: response.secure_url,
        });
        return await this.eventRepository.findOneBy({ id: eventId });
    }
}

