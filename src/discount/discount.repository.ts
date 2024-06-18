import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
import { Discount } from 'src/entities/discount.entity';
import { Event } from 'src/entities/event.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DiscountRepository {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly emailService: EmailService,
  ) {}

  async createDiscount(eventId, discount): Promise<Discount> {
    const discountCode = await this.generateRandomDiscountCode();
    const newDiscount = this.discountRepository.create({
      discount,
      code: discountCode,
      event: { id: eventId },
    });

    const savedDiscount = await this.discountRepository.save(newDiscount);

  // Obtener todos los usuarios
  const users = await this.userRepository.find({where:{isPremium:true}}); // Asegúrate de tener este método en tu servicio de usuarios

  // Obtener el nombre del evento (supone que tienes un método para obtener el evento por ID)
  const event = await this.eventRepository.findOne({where:{id:eventId}});

  // Enviar correo a todos los usuarios
  for (const user of users) {
    await this.emailService.sendNewDiscountEmail(user.email, event.name, discountCode);
  }

  return savedDiscount;
  }

  async getDiscounts(eventId: string) {
    return await this.discountRepository.find({
      where: { event: { id: eventId } },
      // relations: ['event'],
    });
  }

  async findByCode(code: string) {
    return await this.discountRepository.findOne({
      where: { code },
      relations: ['event'],
      select: {
        event: {
          id: true,
        },
      },
    });
  }

  private generateRandomDiscountCode(): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 7; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
