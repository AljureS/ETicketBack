import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Event } from './event.entity';

@Entity({
  name: 'ticket',
})
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();
  @Column({ type: 'int', nullable: false })
  stock: number;
  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  price: number;
  @Column()
  zone: string;
  @ManyToOne(() => Event, (event) => event.tickets)
  @JoinColumn()
  event: Event;
}
