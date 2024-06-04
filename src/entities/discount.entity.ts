import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "./event.entity";

@Entity({
    name: "discount",
})
export class Discount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    discount: number;

    @Column({ nullable: false })
    code: string;

    @ManyToOne(() => Event, (event) => event.discounts)
    @JoinColumn( { name: "event_id" } )
    event: Event;
}