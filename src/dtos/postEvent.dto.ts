import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TicketDto } from './PostTicket.dto';

export class PostEventDto {
  @ApiProperty({
    description: 'El nombre debe ser una cadena de minimo 4 letras',
    example: 'Concierto de Bad Bunny',
  })
  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'La descripcion debe ser una cadena',
    example:
      'Bad Bunny llega a Colombia con un concierto inolvidable, lleno de energía y ritmo, prometiendo una experiencia emocionante.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsString()
  imgUrl: string =
    'https://upload.wikimedia.org/wikipedia/commons/6/64/Ejemplo.png';
  /**
   * La categoria debe ser una categoria registrada
   * @example Reggaeton
   */
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'Debe ser un Date',
    example: '2025/01/20',
  })
  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @ApiProperty({
    description: 'Debe ser un string',
    example: '10.123123',
  })
  @IsString()
  @IsNotEmpty()
  latitude: string;

  @ApiProperty({
    description: 'Debe ser un string',
    example: '-10.123123',
  })
  @IsString()
  @IsNotEmpty()
  longitude: string;

  @ApiProperty({
    description: 'Debe ser un string',
    example: 'Calle falsa 123',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Debe ser un Date',
    example: '2025/01/20',
  })
  @IsNotEmpty()
  @IsDateString()
  launchdate: Date;

  @ApiProperty({
    description: 'Lista de boletos',
    type: [TicketDto],
  })
  @IsArray()
  @ValidateNested({ each: true }) // Para validar cada elemento del array
  @Type(() => TicketDto) // Especifica que se espera un array de Tickets
  tickets: TicketDto[];
}
