import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FxRatesService } from './fx-rates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Currency } from '../common/enums/currency.enum';

@Controller('fx')
//@UseGuards(JwtAuthGuard)
export class FxRatesController {
  constructor(private readonly fxRatesService: FxRatesService) {}

  @Get('rates')
  async getAllRates() {
    return this.fxRatesService.getAllRates();
  }

  @Get('rates/:base/:target')
  async getRate(
    @Param('base') base: string,
    @Param('target') target: string,
  ) {
    const baseCurrency = base.toUpperCase() as Currency;
    const targetCurrency = target.toUpperCase() as Currency;

    const rate = await this.fxRatesService.getRate(baseCurrency, targetCurrency);

    return {
      base: baseCurrency,
      target: targetCurrency,
      rate,
      timestamp: new Date().toISOString(),
    };
  }
}
