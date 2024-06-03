import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Event } from 'src/entities/event.entity';
import { CloudinaryRepository } from './cloudinary.repository';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly cloudinaryRepository: CloudinaryRepository,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async modifyImage(file: Express.Multer.File, eventID: string) {
    //Verificar la existencia del evento
    const event = await this.eventRepository.findOneBy({ id: eventID });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventID} not found.`);
    }
    //* => query a cloudinary
    const response = await this.cloudinaryRepository.uploadImage(file);

    //* => update en la base de datos
    if (!eventID) {
      throw new NotFoundException('Event ID is null.');
    }
    const updateResult = await this.eventRepository.update(
      { id: eventID },
      {
        imgUrl: response.secure_url,
      },
    );
    console.log(updateResult);

    const foundEvent = await this.eventRepository.findOneBy({ id: eventID });
    return foundEvent;
  }

  async uploadImage(file:Express.Multer.File){
    const response = await this.cloudinaryRepository.uploadImage(file);
    return response
  }
}
