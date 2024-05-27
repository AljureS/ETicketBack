import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.respository';

@Injectable()
export class CategoriesService {
    constructor(private categoriesRepository: CategoriesRepository) {}

    getCategories(){
        return this.categoriesRepository.getCategories()
    }
}
