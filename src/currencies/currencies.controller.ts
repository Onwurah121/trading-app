import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currenciesService.create(createCurrencyDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('all')
  findAll() {
    return this.currenciesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('active')
  findAllActive() {
    return this.currenciesService.findAllActive();
  }

  @Get('get-one/:id')
  findOne(@Param('id') id: string) {
    return this.currenciesService.findOne(id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() updateCurrencyDto: UpdateCurrencyDto) {
    return this.currenciesService.update(id, updateCurrencyDto);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.currenciesService.remove(id);
  }
}
