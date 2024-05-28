import { Injectable } from '@nestjs/common';
import { EventsRepository } from './events.repository';

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  getEvents(page: number, limit: number) {
    return this.eventsRepository.getEvents(page, limit);
  }

  getEvent(id) {
    return this.eventsRepository.getEvent(id);
  }

  addEvents() {
    return this.eventsRepository.addEvents();
  }
}
