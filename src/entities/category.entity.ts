import {Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn} from "typeorm"
import {v4 as uuid} from 'uuid'
import {Event} from './event.entity'
@Entity({
    name:"categories"
})
export class Category{
    @PrimaryGeneratedColumn('uuid')
    id: string = uuid()

    @Column({ length:50, nullable:false, unique:true})
    name:string

    @OneToMany(() => Event, (event)=> event.category)
    @JoinColumn()
    event: Event[]
}