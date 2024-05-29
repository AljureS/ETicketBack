import { Injectable } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { PostEventDto } from 'src/dtos/postEvent.dto';
import { ModifyEventDto } from 'src/dtos/modifyEvent.dto';

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
  postEvent(event: PostEventDto) {
    return this.eventsRepository.postEvent(event);
  }
  modifyEvent(id: string, event: ModifyEventDto) {
    return this.eventsRepository.modifyEvent(id, event);
  }
  deleteProduct(id: string) {
    return this.eventsRepository.deleteEvent(id)
 }
}
