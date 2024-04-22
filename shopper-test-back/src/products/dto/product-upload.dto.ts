import { IsNotEmpty, IsNumberString, IsPositive } from 'class-validator';

export class ProductUploadDto {
  @IsNotEmpty()
  @IsNumberString()
  code: string;

  @IsNotEmpty()
  @IsNumberString()
  @IsPositive()
  newPrice: string;
}
