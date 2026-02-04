import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CURRENCY_REPOSITORY } from '../core/constants';
import { Currency } from './entities/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@Injectable()
export class CurrenciesService {
  constructor(
    @Inject(CURRENCY_REPOSITORY)
    private currencyRepository: Repository<Currency>,
  ) {}

  async create(createCurrencyDto: CreateCurrencyDto): Promise<Currency> {
    // Check if currency code already exists
    const existingCurrency = await this.currencyRepository.findOne({
      where: { code: createCurrencyDto.code },
    });

    if (existingCurrency) {
      throw new ConflictException(
        `Currency with code ${createCurrencyDto.code} already exists`,
      );
    }

    const currency = this.currencyRepository.create(createCurrencyDto);
    return this.currencyRepository.save(currency);
  }

  async findAll(): Promise<Currency[]> {
    return this.currencyRepository.find({
      order: { code: 'ASC' },
    });
  }

  async findAllActive(): Promise<Currency[]> {
    return this.currencyRepository.find({
      where: { isActive: true },
      order: { code: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Currency> {
    const currency = await this.currencyRepository.findOne({
      where: { id },
    });

    if (!currency) {
      throw new NotFoundException(`Currency with ID ${id} not found`);
    }

    return currency;
  }

  async findByCode(code: string): Promise<Currency> {
    const currency = await this.currencyRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!currency) {
      throw new NotFoundException(`Currency with code ${code} not found`);
    }

    return currency;
  }

  async update(id: string, updateCurrencyDto: UpdateCurrencyDto): Promise<Currency> {
    const currency = await this.findOne(id);

    // If updating code, check for conflicts
    if (updateCurrencyDto.code && updateCurrencyDto.code !== currency.code) {
      const existingCurrency = await this.currencyRepository.findOne({
        where: { code: updateCurrencyDto.code },
      });

      if (existingCurrency) {
        throw new ConflictException(
          `Currency with code ${updateCurrencyDto.code} already exists`,
        );
      }
    }

    Object.assign(currency, updateCurrencyDto);
    return this.currencyRepository.save(currency);
  }

  async remove(id: string): Promise<void> {
    const currency = await this.findOne(id);
    await this.currencyRepository.remove(currency);
  }
}
