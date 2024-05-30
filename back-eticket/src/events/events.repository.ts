import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Event } from 'src/entities/event.entity';
import { Repository } from 'typeorm';
import { PostEventDto } from 'src/dtos/postEvent.dto';
import { Ticket } from 'src/entities/ticket.entity';
import { ModifyEventDto } from 'src/dtos/modifyEvent.dto';
import * as data from '../utils/data.json';

@Injectable()
export class EventsRepository {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  async getEvents(page: number, limit: number): Promise<Event[]> {
    const startIndex = (page - 1) * limit;
    const events = await this.eventsRepository.find({
      relations: ['category', 'tickets'],
      skip: startIndex,
      take: limit,
    });
    return events;
  }
  async getAllEvents(){
    return await this.eventsRepository.find()
  }
  async getEventsAntiguosARecientes(page: number, limit: number) {
    const eventos = await this.eventsRepository
      .createQueryBuilder('event')
      .orderBy('event.date', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return eventos;
  }
  async getEventsRecientesAAntiguos(page: number, limit: number) {
    const eventos = await this.eventsRepository
      .createQueryBuilder('event')
      .orderBy('event.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return eventos;
  }

  async getEvent(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['category', 'tickets'],
    });
    if (!event) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }
    return event;
  }

  async postEvent(event: PostEventDto, email: string) {
    const { category } = event;
    const categorySearched = await this.categoryRepository.findOne({
      where: { name: category },
    });
    if (!categorySearched) {
      throw new NotFoundException(
        'No existe esa categoria en la base de datos',
      );
    }

    const eventSinTickets = this.eventsRepository.create({
      name: event.name,
      description: event.description,
      category: categorySearched,
      date: event.date,
      location: event.location,
      tickets: [],
      userEmail: email,
    });
    for (const ticket of event.tickets) {
      const newTicket = this.ticketRepository.create({
        stock: ticket.stock,
        price: ticket.price,
        zone: ticket.zone,
      });

      const tickerGuardadoEnDB = await this.ticketRepository.save(newTicket);

      eventSinTickets.tickets.push(tickerGuardadoEnDB);
    }

    return await this.eventsRepository.save(eventSinTickets);
  }

  async modifyEvent(id: string, event: ModifyEventDto, email: string) {
    let eventoBuscado = await this.eventsRepository.findOne({ where: { id } });

    if (!eventoBuscado) throw new NotFoundException('Evento no encontrado');

    const categoriaExisteEnDB = await this.categoryRepository.findOne({
      where: { name: event.category },
    });

    eventoBuscado = {
      ...eventoBuscado,
      ...event,
      category: categoriaExisteEnDB || eventoBuscado.category,
      userEmail: email,
    };

    if (!categoriaExisteEnDB && event.category) {
      const nuevaCategoria = await this.categoryRepository.save({
        name: event.category,
      });
      eventoBuscado.category = nuevaCategoria;
    }

    return await this.eventsRepository.save(eventoBuscado);
  }

  async deleteEvent(id: string): Promise<string> {
    await this.eventsRepository.delete(id);
    return id;
  }

  async preLoadData(): Promise<string> {
    const categories = await this.categoryRepository.find();

    for (const element of data) {
      const category = categories.find(
        (category) => category.name === element.category,
      );

      const newEvent = this.eventsRepository.create({
        name: element.name,
        description: element.description,
        category,
        imgUrl: element.imgUrl,
        date: new Date(element.date),
        location: element.location,
        tickets: [],
      });

      await this.eventsRepository.save(newEvent);

      for (const ticketElement of element.tickets) {
        const newTicket = this.ticketRepository.create({
          event: newEvent,
          price: ticketElement.price,
          stock: ticketElement.stock,
          zone: ticketElement.zone,
        });

        const savedTicket = await this.ticketRepository.save(newTicket);
        newEvent.tickets.push(savedTicket);
        await this.eventsRepository.save(newEvent);
      }
    }

    return 'Eventos creados con éxito!';
  }
}
