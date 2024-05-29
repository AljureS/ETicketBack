import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class PostEventDto {
  @ApiProperty({
    description:"El nombre debe ser una cadena de minimo 4 letras",
    example:"Concierto de Bad Bunny"
  })
  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  name: string; 

  @ApiProperty({
    description:"La descripcion debe ser una cadena",
    example:"Bad Bunny llega a Colombia con un concierto inolvidable, lleno de energía y ritmo, prometiendo una experiencia emocionante."
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
    description:"Debe ser un Date",
    example:"2025/01/20"
  })
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @ApiProperty({
    description:"Debe ser un string",
    example:"Movistar Arena"
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @IsArray()
  @ValidateNested({ each: true }) // Para validar cada elemento del array
  @Type(() => TicketDto) // Especifica que se espera un array de Tickets
  tickets: TicketDto[];
}
class TicketDto {
  /**
   * El precio debe ser un numero
   * @example 300.80
   */
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'Price must be at least 0.01' })
  @Max(9999999.99, { message: 'Price cannot exceed 9999999.99' })
  price: number;

  /**
   * El stock debe ser un numero mayor a cero
   * @example 50
   */
  @IsInt()
  @IsNotEmpty()
  stock: number;

  /**
   * La zona debe ser un string
   * @example General
   */
  @IsNotEmpty()
  @IsString()
  zone: string;
}
