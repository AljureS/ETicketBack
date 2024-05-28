import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Event } from 'src/entities/event.entity';
import { Repository } from 'typeorm';
import * as data from '../utils/data.json';
import { PostEventDto } from 'src/dtos/postEvent.dto';
import { Ticket } from 'src/entities/ticket.entity';
import { ModifyEventDto } from 'src/dtos/modifyEvent.dto';

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
    const endIndex = startIndex + limit;

    const events = await this.eventsRepository.find({
      relations: {
        category: true,
      },
    });

    return events.slice(startIndex, endIndex);
  }

  async getEvent(id: string) {
    const event = await this.eventsRepository.findOneBy({ id });
    if (!event) {
      return `Evento con ID ${id} no encontrado`;
    }
    return event;
  }

  async postEvent(event: PostEventDto) {
    const { category } = event;
    const categorySearched = await this.categoryRepository.findOne({
      where: { name: category },
    });
    if (!categorySearched) {
      throw new NotFoundException(
        'No existe esa categoria en la base de datos',
      );
    }
    //tener cuidado en lo siguiente, no agregamos imagenes! - el front deberia llamar al denpoint "upload/:id"
    //luego de llamar a este endpoint
    const eventSinTickets = this.eventsRepository.create({
      name: event.name,
      description: event.description,
      category: categorySearched,
      fecha: event.fecha,
      ubicacion: event.ubicacion,
      tickets:[]
    });
    for (const ticket of event.tickets) {
      
      const newTicket = this.ticketRepository.create({
        stock: ticket.stock,
        price: ticket.price,
        localization: ticket.localization
      });
      
      const tickerGuardadoEnDB = await this.ticketRepository.save(newTicket);
      eventSinTickets.tickets.push(tickerGuardadoEnDB)
    }
    const eventConTicketsEnDB =
      await this.eventsRepository.save(eventSinTickets);
    return eventConTicketsEnDB;
  }

  async modifyEvent(id:string,event: ModifyEventDto) {
    let eventoBuscado = await this.eventsRepository.findOne({where:{id}})
    if(!eventoBuscado)throw new NotFoundException("Evento no encontrado")
      const categoriaExisteEnDB = await this.categoryRepository.findOne({where:{name:event.category}})
    if(categoriaExisteEnDB){
      eventoBuscado = {...eventoBuscado, ...event, category:categoriaExisteEnDB}
    }if(!categoriaExisteEnDB && event.category){
      const nuevaCategoria = await this.categoryRepository.save({name:event.category})
      eventoBuscado = {...eventoBuscado, ...event, category:nuevaCategoria}
    }else{
      eventoBuscado = {...eventoBuscado, ...event, category:eventoBuscado.category}
    }
    
    return await this.eventsRepository.save(eventoBuscado)
  }

  async deleteEvent(id: string) {
    await this.eventsRepository.delete(id)
    return id
 }

  //TODO: hay que arreglarlo
  async addEvents() {
    try {
      const categories = await this.categoryRepository.find();
      if (categories.length === 0) {
        return 'No se pueden crear eventos sin género';
      }

      const existingEvents = await this.eventsRepository.find();
      const existingEventsName = existingEvents.map((event) => event.name);

      const newEventsName = data.map((element) => element.name);
      const duplicateEvents = newEventsName.filter((name) =>
        existingEventsName.includes(name),
      );

      if (duplicateEvents.length > 0) {
        return 'El evento ya está en la base de datos';
      }

      await Promise.all(
        data.map(async (element) => {
          const category = categories.find(
            (category) => category.name === element.category,
          );

          const event = new Event();
          event.name = element.name;
          event.description = element.description;
          event.imgUrl = element.imgUrl;
          event.category = category;

          await this.eventsRepository
            .createQueryBuilder()
            .insert()
            .into(Event)
            .values(event)
            .execute();
        }),
      );

      return 'Evento creado!';
    } catch (error) {
      console.error('Error al crear evento');
      throw error;
    }
  }
}
