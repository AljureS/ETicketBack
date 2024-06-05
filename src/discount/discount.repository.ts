import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateDiscountDto } from "src/dtos/discount.dto";
import { Discount } from "src/entities/discount.entity";
import { Repository } from "typeorm";

@Injectable()
export class DiscountRepository {
    constructor(
        @InjectRepository(Discount)
        private readonly discountRepository: Repository<Discount>
    ) {}

    async createDiscount (eventId, discount): Promise<Discount> {
        const discountCode = await this.generateRandomDiscountCode();
        const newDiscount = this.discountRepository.create({
            discount,
            code: discountCode,
            event: { id: eventId }
        });

        return await this.discountRepository.save(newDiscount);
    }

    async findByCode(code: string){
        return await this.discountRepository.findOne({ where: { code } });
    }

    private generateRandomDiscountCode(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < 7; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

} 