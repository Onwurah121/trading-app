import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FxRatesService } from './fx-rates.service';

@Controller('fx')
//@UseGuards(JwtAuthGuard)
export class FxRatesController {
  constructor(private readonly fxRatesService: FxRatesService) {}

  @Get('pairs')
  async getAllPairs() {
    return this.fxRatesService.getAllPairsRates();
  }
}
