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
  /**
   * El nombre debe ser una cadena de minimo 4 letras
   * @example Concierto de Bad Bunny
   */
  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * La descripcion debe ser una cadena
   * @example Bad Bunny llega a [Ciudad] con un concierto inolvidable, lleno de energía y ritmo, prometiendo una experiencia emocionante.
   */
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsString()
  imgUrl: string =
    'https://upload.wikimedia.org/wikipedia/commons/6/64/Ejemplo.png';
  /**
   * La categoria debe ser una categoria registrada
   * @example Smartphone
   */
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNotEmpty()
  @IsDate()
  fecha: Date;

  @IsString()
  @IsNotEmpty()
  ubicacion: string;

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

  @IsNotEmpty()
  @IsString()
  localization: string;
}
