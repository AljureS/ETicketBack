import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Event } from './event.entity';

@Entity({
  name: 'ticketVendido',
})
export class TicketVendido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() 
  zone: string;

  @Column({default:false})
  isUsed:boolean

  @ManyToOne(() => Event, (event) => event.ticketsVendidos)
  @JoinColumn()
  event: Event;
  @Column()
  userId:string
}
