import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Event } from 'src/entities/event.entity';
import { Repository } from 'typeorm';
import * as data from '../utils/data.json';

@Injectable()
export class EventsRepository {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getEvents(page: number, limit: number): Promise<Event[]> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    let events = await this.eventsRepository.find({
      relations: {
        category: true,
      },
    });

    events = events.slice(startIndex, endIndex);

    return events;
  }

  async getEvent(id: string) {
    const event = await this.eventsRepository.findOneBy({ id });
    if (!event) {
        return `Evento con ID ${id} no encontrado`;
    }
    return event;
}
  async addEvents () {
    try {
        const categories = await this.categoryRepository.find();
        if(categories.length === 0) {
          return 'No se pueden crear eventos sin género';
        }

      const existingEvents = await this.eventsRepository.find();
      const existingEventsName = existingEvents.map(event => event.name);

      const newEventsName = data.map(element => element.name);
      const duplicateEvents = newEventsName.filter(name => existingEventsName.includes(name));

      if(duplicateEvents.length > 0) {
        return 'El evento ya está en la base de datos';
      }

      await Promise.all(data.map(async (element) => {
        const category = categories.find(
          (category) => category.name === element.category,
        );

        const event = new Event ();
        event.name = element.name;
        event.description = element.description;
        event.imgUrl = element.imgUrl;
        event.category = category;

        await this.eventsRepository
        .createQueryBuilder()
        .insert()
        .into(Event)
        .values(event)
        .execute()
      }));

      return 'Evento creado!'
    } catch (error) {
      console.error('Error al crear evento');
      throw error;
    }
  }
}
