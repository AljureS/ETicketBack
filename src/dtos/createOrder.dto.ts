import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsArray,
  ArrayMinSize,
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { isFloat } from 'validator';

export class CreateOrderDto {
  /**
   * El id de usuario debe ser un UUID
   * @example 550e8400-e29b-41d4-a716-446655440000
   */
  @IsOptional()
  @IsString()
  @IsUUID('4')
  userId: string;

  /**
   * Los productos deben ser un array de objetos que contengan únicamente el id del producto
   * @example Inserte un array que contenga objetos como el siguiente, en formato JSON, es decir la propiedad y el valor entre comillas dobles {id:37938ed8-8546-4830-8229-799da418ba7c}
   */
  @IsArray()
  @ArrayMinSize(1)
  tickets: TicketDto[];
}

class TicketDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID('4')
  id: string;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  price:number
}
