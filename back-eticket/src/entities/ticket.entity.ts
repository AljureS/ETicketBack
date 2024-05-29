import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Event } from './event.entity';

@Entity({
  name: 'ticket',
})
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: false })
  stock: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  price: number;

  @Column()
  zone: string;

  @ManyToOne(() => Event, (event) => event.tickets)
  event: Event;
}
