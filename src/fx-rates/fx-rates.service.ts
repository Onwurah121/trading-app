import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Currency } from '../common/enums/currency.enum';

interface CachedRate {
  rate: number;
  timestamp: number;
}

@Injectable()
export class FxRatesService {
  private cache: Map<string, CachedRate> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get('FX_API_URL');
    this.apiKey = this.configService.get('FX_API_KEY');
  }

  async getRate(from: Currency, to: Currency): Promise<number> {
    if (from === to) {
      return 1;
    }

    const cacheKey = `${from}_${to}`;
    const cached = this.cache.get(cacheKey);

    // Return cached rate if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.rate;
    }

    try {
      // Fetch fresh rate from API
      const rate = await this.fetchRateFromAPI(from, to);
      
      // Cache the rate
      this.cache.set(cacheKey, {
        rate,
        timestamp: Date.now(),
      });

      return rate;
    } catch (error) {
      // If API fails and we have a cached rate (even expired), use it
      if (cached) {
        console.warn(
          `Using expired cache for ${from}/${to} due to API error`,
          error.message,
        );
        return cached.rate;
      }

      throw new Error(
        `Failed to fetch exchange rate for ${from}/${to}: ${error.message}`,
      );
    }
  }

  async getAllRates(baseCurrency: Currency = Currency.NGN): Promise<any> {
    const rates = {};
    const currencies = Object.values(Currency).filter(
      (curr) => curr !== baseCurrency,
    );

    for (const currency of currencies) {
      try {
        rates[currency] = await this.getRate(baseCurrency, currency);
      } catch (error) {
        console.error(`Error fetching rate for ${currency}:`, error.message);
        rates[currency] = null;
      }
    }

    return {
      base: baseCurrency,
      rates,
      timestamp: new Date().toISOString(),
    };
  }

  private async fetchRateFromAPI(
    from: Currency,
    to: Currency,
  ): Promise<number> {
    try {
      const url = `${this.apiUrl}/${this.apiKey}/pair/${from}/${to}`;
      const response = await axios.get(url, { timeout: 5000 });

      if (response.data && response.data.conversion_rate) {
        return response.data.conversion_rate;
      }

      throw new Error('Invalid API response format');
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`Currency pair ${from}/${to} not supported`);
      }

      throw error;
    }
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache(): void {
    this.cache.clear();
  }
}
