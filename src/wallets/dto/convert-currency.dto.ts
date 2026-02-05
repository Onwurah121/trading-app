import { IsEnum, IsNumber, IsPositive, IsString } from 'class-validator';
import { Currency } from '../../common/enums/currency.enum';
import { Type } from 'class-transformer';

export class ConvertCurrencyDto {
  @IsString()
  fromCurrency: string;

  @IsString()
  toCurrency: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;
}
