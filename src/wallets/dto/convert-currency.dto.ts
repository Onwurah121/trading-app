import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '../../common/enums/currency.enum';
import { Type } from 'class-transformer';

export class ConvertCurrencyDto {
  @ApiProperty({ enum: Currency, example: Currency.NGN })
  @IsEnum(Currency)
  fromCurrency: Currency;

  @ApiProperty({ enum: Currency, example: Currency.USD })
  @IsEnum(Currency)
  toCurrency: Currency;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;
}
