import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryRepository } from './cloudinary.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from 'src/entities/event.entity';

@Injectable()
export class CloudinaryService {
    constructor(
        private readonly cloudinaryRepository: CloudinaryRepository,
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>
    ) {}

    async uploadImage(file: Express.Multer.File, productId: string) {
        //Verificar la existencia del producto 
        const product = await this.eventRepository.findOneBy({id: productId});
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found.`);
        }
        //* => query a cloudinary
        const response = await this.cloudinaryRepository.uploadImage(file);

        //* => update en la base de datos
        if (!productId) {
            throw new NotFoundException('Product ID is null.');
        }
        const updateResult = await this.eventRepository.update({id: productId}, {
            imgUrl: response.secure_url
        })
        console.log(updateResult);
        

        const foundProduct = await this.eventRepository.findOneBy({id: productId});
        return foundProduct
    }
}
