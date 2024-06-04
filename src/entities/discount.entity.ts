import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

    
}