import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./category.entity"; // Asegúrate de que la ruta sea correcta

@Injectable()
export class CategoriesRepository {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    async getCategories() {
        return await this.categoryRepository.find();
    }

}