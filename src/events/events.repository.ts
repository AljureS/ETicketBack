import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Event } from 'src/entities/event.entity';
import { Repository } from 'typeorm';
import { PostEventDto } from 'src/dtos/postEvent.dto';
import { Ticket } from 'src/entities/ticket.entity';
import { ModifyEventDto } from 'src/dtos/modifyEvent.dto';
import * as data from '../utils/data.json';
import { Status } from './events.enum';
import { User } from 'src/entities/user.entity';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class EventsRepository {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly emailService: EmailService,

  ) {}

  private updateEventStatus(event: Event) {
    const dateNow = new Date();
    dateNow.setUTCHours(0, 0, 0, 0); // Establecer horas, minutos, segundos y milisegundos a 0 en UTC
  
    const launchDate = new Date(event.launchdate);
    launchDate.setDate(launchDate.getDate() - 1);
    launchDate.setUTCHours(0, 0, 0, 0); // Establecer horas, minutos, segundos y milisegundos a 0 en UTC
  
    const oneDayBeforeLaunch = new Date(launchDate);
    oneDayBeforeLaunch.setDate(launchDate.getDate() - 1);
    oneDayBeforeLaunch.setUTCHours(0, 0, 0, 0); // Establecer horas, minutos, segundos y milisegundos a 0 en UTC
  
    console.log(dateNow, launchDate, oneDayBeforeLaunch);
  
    if (launchDate.getTime() > dateNow.getTime()) {
      event.status = Status.NOT_AVAILABLE;
    } else if (launchDate.getTime() <= dateNow.getTime()) {
      event.status = Status.AVAILABLE;
    }

    if (oneDayBeforeLaunch.getTime() === dateNow.getTime()) {
      event.status = Status.AVAILABLE_PREMIUM;
    }
    return event;
}

  
  
  
  
  async getAllEvents() {
    const events = await this.eventsRepository.find({
      relations: ['category', 'tickets'],
    });
    return events.map(event => {
      return this.updateEventStatus(event);
    });
  }
  
  
  

  async getEvents(page: number, limit: number, category?: string) {
    const startIndex = (page - 1) * limit;
  
    let whereClause = {};
    if (category !== undefined) {
      whereClause = { category: { name: category.toUpperCase() } };
    }
  
    const [events, total] = await this.eventsRepository.findAndCount({
      relations: ['category', 'tickets'],
      where: whereClause,
      skip: startIndex,
      take: limit,
    });
  
  
    return {
      events: events.map(event => {
        return this.updateEventStatus(event)
      }),
      total,
    };
  }
  

  async getEventsByDate(
    page: number,
    limit: number,
    category?: string,
    order?: 'ascending' | 'descending',
  ) {
    const startIndex = (page - 1) * limit;
  
    // Construcción del whereClause
    let whereClause = {};
    if (category !== undefined) {
      whereClause = { category: { name: category.toUpperCase() } };
    }
  
    // Determinar el orden de la fecha
    let orderDirection: 'ASC' | 'DESC' = 'DESC'; // Valor por defecto
    if (order === 'ascending') {
      orderDirection = 'ASC';
    } else if (order === 'descending') {
      orderDirection = 'DESC';
    }
  
    // Construcción del queryBuilder con las condiciones y ordenamiento
    const queryBuilder = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.tickets', 'ticket')
      .where(whereClause)
      .orderBy('event.date', orderDirection)
      .skip(startIndex)
      .take(limit);
  
    const [events, total] = await queryBuilder.getManyAndCount();
  
  
    return {
      events: events.map(event => {
        return this.updateEventStatus(event)
      }),
      total,
    };
  }
  

  async getEvent(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['category', 'tickets'],
    });
  
    if (!event) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }
  
    return this.updateEventStatus(event);
  }
  

  async getEventsAZ(
    order: 'ascending' | 'descending',
    page: number,
    limit: number,
    category?: string,
  ): Promise<{ events: Event[]; total: number }> {
    const orderDirection = order === 'ascending' ? 'ASC' : 'DESC';
    const startIndex = (page - 1) * limit;
  
    // Construcción del whereClause
    let whereClause = {};
    if (category !== undefined) {
      whereClause = { category: { name: category.toUpperCase() } };
    }
  
    const queryBuilder = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.tickets', 'ticket')
      .leftJoinAndSelect('event.category', 'category')
      .where(whereClause)
      .orderBy('event.name', orderDirection)
      .skip(startIndex)
      .take(limit);
  
    const [events, total] = await queryBuilder.getManyAndCount();
  
  
    return {
      events: events.map(event => {
        return this.updateEventStatus(event)
      }),
      total,
    };
  }
  

  //ESTA ESTARIA EN DES USO
  async getEventsByCategory(page: string, limit: string, category: string) {
    const [data, count] = await this.eventsRepository.findAndCount({
      where: { category: { name: category } },
      relations: ['category', 'tickets'], // Agregar las relaciones aquí
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });
  
  
    return { events: data.map(event => {
      return this.updateEventStatus(event)
    }), count };
  }
  
  async getEventsByPrice(
    order: 'ascending' | 'descending',
    page: number,
    limit: number,
    category?: string, // Hacer la categoría opcional
  ): Promise<Event[]> {
    const orderDirection = order === 'ascending' ? 'ASC' : 'DESC';
    const startIndex = (page - 1) * limit;
  
    let categoryFilter = {}; // Objeto vacío para filtrar todas las categorías si no se proporciona una
  
    if (category) {
      // Si se proporciona una categoría, filtrar por ella
      const categoryEntity = await this.categoryRepository.findOne({
        where: { name: category.toUpperCase() },
      });
  
      if (!categoryEntity) {
        throw new NotFoundException(`Categoría ${category} no encontrada`);
      } else categoryFilter = { category: categoryEntity.id };
    }
  
    // Subconsulta para obtener los IDs de los eventos ordenados por el precio mínimo
    const subQuery = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoin('event.tickets', 'ticket')
      .select('event.id')
      .addSelect('MIN(ticket.price)', 'minPrice')
      .where(categoryFilter) // Aplicar el filtro de categoría
      .groupBy('event.id')
      .orderBy('"minPrice"', orderDirection)
      .skip(startIndex)
      .take(limit);
  
    // Ejecutar la subconsulta y obtener los resultados crudos
    const rawResults = await subQuery.getRawMany();
    const eventIds = rawResults.map((result) => result.event_id);
  
    // Obtener los eventos completos usando los IDs de la subconsulta
    const events = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.tickets', 'ticket')
      .whereInIds(eventIds)
      .andWhere(categoryFilter) // Aplicar el filtro de categoría
      .orderBy(
        `CASE event.id ${eventIds.map((id, index) => `WHEN '${id}' THEN ${index}`).join(' ')} END`,
      )
      .getMany();
  
    return events.map(event => {
      return this.updateEventStatus(event)
    });
  }
  
  async getEventOfUser(email: string) {
    const events = await this.eventsRepository.find({
      where: { userEmail: email },
      relations: { tickets: true, category: true },
    });
  
    return events.map(event => {
      return this.updateEventStatus(event)
    });
  }
  

  async buscar(keyword: string): Promise<Event[]> {
    const events = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.tickets', 'tickets')
      .where('event.name ILIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();
  
    return events.map(event => {
      return this.updateEventStatus(event)
    });
  }
  
  async postEvent(event: PostEventDto, email: string) {
    const { category } = event;
    const categorySearched = await this.categoryRepository.findOne({
      where: { name: category },
    });
    const existeElEvento = await this.eventsRepository.findOne({
      where: { name: event.name },
    });

    if (existeElEvento)
      throw new BadRequestException('Ya existe un Evento con ese nombre');
    if (!categorySearched) {
      throw new NotFoundException('No existe esa categoria en la base de datos');
    }

    const eventSinTickets = this.eventsRepository.create({
      name: event.name,
      description: event.description,
      category: categorySearched,
      date: event.date,
      latitude: event.latitude,
      longitude: event.longitude,
      tickets: [],
      userEmail: email,
      imgUrl: event.imgUrl,
      address: event.address,
      launchdate: event.launchdate,
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

    const savedEvent = await this.eventsRepository.save(eventSinTickets);

    // Obtener todos los usuarios y enviarles un correo
    const users = await this.userRepository.find({where:{isPremium:true}});
    for (const user of users) {
      await this.emailService.sendNewEventEmail(user.email, savedEvent);
    }

    return savedEvent;
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
    const count = await this.eventsRepository.count();
    if (count > 0) {
      throw new BadRequestException('Ya existen eventos en la tabla');
    }
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
        latitude: element.latitude,
        longitude: element.longitude,
        tickets: [],
        address: element.address,
        launchdate: element.launchdate,
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
