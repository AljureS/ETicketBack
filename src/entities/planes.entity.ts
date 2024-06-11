import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"
import {v4 as uuid} from 'uuid'
@Entity({
    name:"planes"
})
export class Planes{
    @PrimaryGeneratedColumn('uuid')
    id: string = uuid()

    @Column({ length:50, nullable:false, unique:true})
    name:string

    @Column({nullable:false})
    code:string
}