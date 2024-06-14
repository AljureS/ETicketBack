import { Injectable } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { PostEventDto } from 'src/dtos/postEvent.dto';
import { ModifyEventDto } from 'src/dtos/modifyEvent.dto';

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  getEvents(page: number, limit: number, category:string) {
    return this.eventsRepository.getEvents(page, limit,category);
  }
  getEventsByDate(page: number, limit: number, category?: string, order?: 'ascending' | 'descending'){
    return this.eventsRepository.getEventsByDate(page,limit, category, order)
  } 
  getAllEvents(){
    return this.eventsRepository.getAllEvents()
  }

  getEvent(id) {
    return this.eventsRepository.getEvent(id);
  }
  getEventOfUser(email:string){
    return this.eventsRepository.getEventOfUser(email)
  }

  getEventsAZ(
    order: 'ascending' | 'descending',
    page: number, 
    limit: number,
    category?: string
  ) {
    return this.eventsRepository.getEventsAZ(order, page, limit, category);
  }
  getEventsByCategory(page: string,limit: string,category:string){
    return this.eventsRepository.getEventsByCategory(page,limit,category)
  }

  getEventsByPrice(
    order: 'ascending' | 'descending',
    page: number, 
    limit: number,
    category?:string
  ) {
    return this.eventsRepository.getEventsByPrice(order, page, limit, category);
  }

  buscar(keyword: string){
    return this.eventsRepository.buscar(keyword)
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
