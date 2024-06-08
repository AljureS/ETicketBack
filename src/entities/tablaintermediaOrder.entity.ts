import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from './user.entity';
import { OrderDetails } from './orderDetails.entity';
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

  @OneToMany(
    () => TablaIntermediaTicket,
    (ticket) => ticket.tablaIntermediaOrder,
  )
  @JoinColumn({ name: 'ticket_id' })
  tablaIntermediaTicket: TablaIntermediaTicket[];
}
