import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { Currency } from '../../common/enums/currency.enum';
import { Type } from 'class-transformer';

export class ConvertCurrencyDto {
  @IsEnum(Currency)
  fromCurrency: Currency;

  @IsEnum(Currency)
  toCurrency: Currency;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;
}
