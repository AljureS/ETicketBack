import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
import * as data from '../utils/data.json';
@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async getCategories() {
    return await this.categoriesRepository.find();
  }

  async addCategories() {
    const existingCategories = await this.categoriesRepository.find();
    const existingCategoryNames = existingCategories.map(
      (category) => category.name,
    );

    let addedCategories = 0;

    for (const element of data) {
      if (!existingCategoryNames.includes(element.category)) {
        await this.categoriesRepository
          .createQueryBuilder()
          .insert()
          .into(Category)
          .values({ name: element.category })
          .execute();
        existingCategoryNames.push(element.category);
        addedCategories++;
      }
    }

    if (addedCategories === 0) {
      return 'El género ya existe en la base de datos.';
    } else {
      return 'Géneros agregados, ya puedes crear tu evento';
    }
  }
}
