import {
  Entity,
  PrimaryGeneratedColumn,
  JoinTable,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Category } from './category.entity';
import { OrderDetails } from './orderDetails.entity';
import { Ticket } from './ticket.entity';

@Entity({
  name: 'event',
})
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({ length: 50, nullable: false, unique:true })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({
    type: 'varchar',
    default: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Ejemplo.png',
  })
  imgUrl: string;

  @ManyToOne(() => Category, (category) => category.event)
  category: Category;

  @Column({ nullable: false, type: 'date' })
  date: Date;

  @Column()
  location:string

  // Relación N:N con orderDetails.
  @ManyToMany(() => OrderDetails, (orderDetail) => orderDetail.events)
  @JoinTable()
  orderDetails: OrderDetails[];

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  @JoinColumn()
  tickets: Ticket[];
}

// @ManyToMany(() => Category)
// @JoinTable()
// categories: Category[]
