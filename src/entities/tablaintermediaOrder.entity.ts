import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { TablaIntermediaTicket } from './TablaIntermediaTicket.entity';

@Entity({
  name: 'tablaIntermediaOrder',
})
export class TablaIntermediaOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column()
  user: string;

  @Column()
  paymentMethod: string;

  @Column({ default: false })
  isUsed: boolean;

  @OneToMany(
    () => TablaIntermediaTicket,
    (ticket) => ticket.tablaIntermediaOrder,
  )
  @JoinColumn({ name: 'ticket_id' })
  tablaIntermediaTicket: TablaIntermediaTicket[];
}
