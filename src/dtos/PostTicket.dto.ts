import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class TicketDto {
  @ApiProperty({ example: 300.8, description: 'El precio debe ser un número' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'Price must be at least 0.01' })
  @Max(9999999.99, { message: 'Price cannot exceed 9999999.99' })
  price: number;

  @ApiProperty({
    example: 50,
    description: 'El stock debe ser un número mayor a cero',
  })
  @IsInt()
  @IsNotEmpty()
  stock: number;

  @ApiProperty({
    example: 'General',
    description: 'La zona debe ser un string',
  })
  @IsNotEmpty()
  @IsString()
  zone: string;
}
