import {
  Entity,
  PrimaryGeneratedColumn,
  Column, 
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { OrderDetails } from './orderDetails.entity';
import { Ticket } from './ticket.entity';
import { Discount } from './discount.entity';
import { TicketVendido } from './ticketVendido.entity';

@Entity({
  name: 'event',
})
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, nullable: false, unique: true })
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
  latitude: string; 

  @Column()
  longitude: string;

  @Column()
  address:string;

  @Column({nullable:true})
  userEmail?:string

  @ManyToMany(() => OrderDetails, (orderDetail) => orderDetail.events)
  orderDetails: OrderDetails[];

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  @JoinColumn({ name: 'ticket_id' })
  tickets: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  @JoinColumn({ name: 'ticket_id' })
  ticketsVendidos: TicketVendido[];


  @OneToMany(() => Discount, (discount) => discount.event)
  @JoinColumn({ name: 'discount_id' })
  discounts: Discount[];
}
