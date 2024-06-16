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

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  @IsUUID('4')
  userId: string;

  /**
   * El metodo de pago debe ser mercadopago o paypal
   * @example paypal
   */
  @IsString()
  paymentMethod: string;

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
  price: number;
}
