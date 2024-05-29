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

  async postEvent(event: PostEventDto, email:string) {
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
      date: event.date,
      location: event.location,
      tickets: [],
      userEmail:email
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
    const eventConTicketsEnDB =
      await this.eventsRepository.save(eventSinTickets);
    return eventConTicketsEnDB;
  }

  async modifyEvent(id: string, event: ModifyEventDto, email:string) {
    let eventoBuscado = await this.eventsRepository.findOne({ where: { id } });
    
    if (!eventoBuscado) throw new NotFoundException('Evento no encontrado');
    const categoriaExisteEnDB = await this.categoryRepository.findOne({
      where: { name: event.category },
    });
    if (categoriaExisteEnDB) {
      eventoBuscado = {
        ...eventoBuscado,
        ...event,
        category: categoriaExisteEnDB,
      };
    }
    if (!categoriaExisteEnDB && event.category) {
      const nuevaCategoria = await this.categoryRepository.save({
        name: event.category,
      });
      eventoBuscado = { ...eventoBuscado, ...event, category: nuevaCategoria };
    } else {
      eventoBuscado = {
        ...eventoBuscado,
        ...event,
        category: eventoBuscado.category,
      };
    }

    return await this.eventsRepository.save(eventoBuscado);
  }

  async deleteEvent(id: string) {
    await this.eventsRepository.delete(id);
    return id;
  }

  //TODO: hay que arreglarlo
  async preLoadData() {
    // Verificar si existe esa categoria 
    const categories = await this.categoryRepository.find();
    data?.map(async (element) => {
        const category = categories.find(
            (category) => category.name === element.category
        )
        // Se necesita crear el producto que va en database
        
        const newEvent = new Event()
        newEvent.name = element.name
        newEvent.description = element.description
        newEvent.category = category
        newEvent.imgUrl = element.imgUrl
        newEvent.date = new Date(element.date)
        newEvent.location = element.location
        newEvent.tickets = []
    //aÑADIR ESTO A LA BD
    await this.eventsRepository
        .createQueryBuilder() // para crear la consulta SQL 
        .insert() // insercion de datos 
        .into(Event) // En esa entidad van los datos 
        .values(newEvent) // valor que va en entidad 
        //.orIgnore() // no inserta si ya existe //? si ya existe se actualiza =>
        // .orUpdate(
        //     [ "description", "imgUrl"],["name"] //* name no se actualiza
        // )
        .execute()
    
        newEvent.tickets = []

        const newTicket = new Ticket()
        element.tickets.forEach(async (element) => {
          newTicket.event = newEvent
          newTicket.price = element.price
          newTicket.stock = element.stock
          newTicket.zone = element.zone

          await this.ticketRepository
          .createQueryBuilder() // para crear la consulta SQL 
          .insert() // insercion de datos 
          .into(Ticket) // En esa entidad van los datos 
          .values(newTicket) // valor que va en entidad
          .execute()

        });
        newEvent.tickets.push(newTicket)
        
        await this.eventsRepository.save(newEvent)
    })

    return 'eventos creados'
  }
}
