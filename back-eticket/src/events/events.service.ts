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
  getEventsAntiguosARecientes(page: number, limit: number){
    return this.eventsRepository.getEventsAntiguosARecientes(page,limit)
  }
  getEventsRecientesAAntiguos(page: number, limit: number){
    return this.eventsRepository.getEventsRecientesAAntiguos(page,limit)
  }

  getEvent(id) {
    return this.eventsRepository.getEvent(id);
  }

  preLoadData() {
    return this.eventsRepository.preLoadData(); 
  }
  postEvent(event: PostEventDto, email:string) {
    return this.eventsRepository.postEvent(event, email);
  }
  modifyEvent(id: string, event: ModifyEventDto, email:string) {
    return this.eventsRepository.modifyEvent(id, event, email);
  }
  deleteProduct(id: string) {
    return this.eventsRepository.deleteEvent(id)
 }
}
