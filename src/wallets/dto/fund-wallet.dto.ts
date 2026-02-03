import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '../../common/enums/currency.enum';
import { Type } from 'class-transformer';

export class FundWalletDto {
  @ApiProperty({ enum: Currency, example: Currency.NGN })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;
}
