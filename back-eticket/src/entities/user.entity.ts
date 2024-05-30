import {Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn} from "typeorm"
import {v4 as uuid} from 'uuid'
import { Order } from "./order.entity"
@Entity({
    name:"users"
})
export class User{
    @PrimaryGeneratedColumn('uuid')
    id: string = uuid()

    @Column({ length: 50, nullable: false })
    name: string

    @Column({ length: 50, nullable: false })
    lastName: string

    @Column()
    phone: string

    @Column({length:50,unique:true,nullable:false})
    email:string

    @Column({nullable:false, length:150})
    password: string

    @Column({default:false})
    isAdmin:boolean

    @Column({default:false})
    isSuperAdmin:boolean

    @Column({default:false})
    isEmailConfirmed:boolean

    @OneToMany(() => Order, (order) => order.user)
    @JoinColumn()
    orders: Order[]
}