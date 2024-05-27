import {Entity, PrimaryGeneratedColumn, Column,OneToOne, ManyToMany, JoinColumn} from "typeorm"
import {v4 as uuid} from 'uuid'
import { Order } from "./order.entity"
import { Event } from "./event.entity"


@Entity({
    name:"ordersDetails"
})
export class OrderDetails{
    @PrimaryGeneratedColumn('uuid')
    id: string = uuid()

    @Column('decimal', { precision: 10, scale: 2, nullable: false })
    price: number

    @OneToOne(() => Order)
    @JoinColumn()
    order: Order

    @ManyToMany(()=> Event, (event)=> event.orderDetails)
    events: Event[]

}

