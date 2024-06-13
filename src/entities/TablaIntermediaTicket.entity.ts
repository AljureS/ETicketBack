import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Event } from './event.entity';
import { TablaIntermediaOrder } from './tablaintermediaOrder.entity';

@Entity({
  name: 'tablaIntermediaTicket',
})
export class TablaIntermediaTicket {
  @PrimaryGeneratedColumn()
  idFicticio: string;
  
  @Column()
  id: string;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  price: number;

  @ManyToOne(() => TablaIntermediaOrder, (order) => order.tablaIntermediaTicket)
  @JoinColumn()
  tablaIntermediaOrder: TablaIntermediaOrder;
}
