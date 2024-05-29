import { Type } from 'class-transformer';
import {
    IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class PostTicketDto {
  /**
   * Debe ser un numero entero
   * @example 50
   */
  @IsInt()
  @IsNotEmpty()
  stock: number;

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
    * Debe ser un string
    * @example Estadio Gran Rex
    */
  @IsNotEmpty()
  @IsString()
  zone:string

  @IsString()
  @IsNotEmpty()
  eventName:string
}
