import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FxRatesService } from './fx-rates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Currency } from '../common/enums/currency.enum';

@ApiTags('FX Rates')
@Controller('fx')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FxRatesController {
  constructor(private readonly fxRatesService: FxRatesService) {}

  @Get('rates')
  @ApiOperation({ summary: 'Get all FX rates for supported currencies' })
  @ApiResponse({ status: 200, description: 'Returns all exchange rates' })
  async getAllRates() {
    return this.fxRatesService.getAllRates();
  }

  @Get('rates/:base/:target')
  @ApiOperation({ summary: 'Get exchange rate for specific currency pair' })
  @ApiResponse({ status: 200, description: 'Returns exchange rate' })
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
