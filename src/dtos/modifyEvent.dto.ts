import { IsOptional, IsString, IsDate } from 'class-validator';

export class ModifyEventDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsDate()
  date: Date;

  @IsString()
  @IsOptional()
  latitude: string;

  @IsOptional()
  @IsString()
  longitude: string;

  @IsOptional()
  @IsString()
  address: string;
}
