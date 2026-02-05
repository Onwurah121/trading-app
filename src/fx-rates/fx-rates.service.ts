import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Currency } from '../common/enums/currency.enum';
import { CurrenciesService } from '../currencies/currencies.service';
import { Currency as CurrencyEntity } from '../currencies/entities/currency.entity';

interface CachedRate {
  rate: number;
  timestamp: number;
}

interface CachedCurrencies {
  currencies: CurrencyEntity[];
  timestamp: number;
}

@Injectable()
export class FxRatesService {
  private cache: Map<string, CachedRate> = new Map();
  private currenciesCache: CachedCurrencies | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes for rates
  private readonly CURRENCIES_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for currencies list
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private currenciesService: CurrenciesService,
  ) {
    this.apiUrl = this.configService.get('FX_API_URL');
  }

  /**
   * Get active currencies from cache or database
   */
  private async getActiveCurrencies(): Promise<CurrencyEntity[]> {
    // Return cached currencies if still valid
    if (
      this.currenciesCache &&
      Date.now() - this.currenciesCache.timestamp < this.CURRENCIES_CACHE_TTL
    ) {
      return this.currenciesCache.currencies;
    }

    // Fetch fresh currencies from database
    const currencies = await this.currenciesService.findAllActive();

    // Cache the currencies
    this.currenciesCache = {
      currencies,
      timestamp: Date.now(),
    };

    return currencies;
  }

  async getRate(from: string, to: string): Promise<number> {
    if (from === to) {
      return 1;
    }

    const cacheKey = `${from}`;
    const cached = this.cache.get(cacheKey);

    // Return cached rate if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.rate;
    }

    try {
      // Fetch fresh rate from API
      const rate = await this.fetchRateFromAPI(from);
      
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
          error,
        );
        return cached.rate;
      }

      throw new Error(
        `Failed to fetch exchange rate for ${from}/${to}: ${error}`,
      );
    }
  }

  private async fetchRateFromAPI(
    from: string,
  ): Promise<number> {
    try {
      const url = `${this.apiUrl}/${from}`;

      const response = await axios.get(url, { timeout: 5000 });

      if (response.data && response.data.conversion_rates) {
        return response.data.conversion_rates;
      }

      throw new Error('Invalid API response format');
    } catch (error) {
      let errorMessage = "An Unexpected error occurred while fetching exchange rate"
      // if (error.response?.status === 404) {
      //   throw new Error(`Currency pair ${from}/${to} not supported`);
      // }
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = error.response.data.message || JSON.stringify(error.response.data);
        } else if (error.request) {
          errorMessage = "No response from the API.";
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = error instanceof Error ? error.message : `${error}`;
      }

      throw errorMessage;
    }
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache(): void {
    this.cache.clear();
    this.currenciesCache = null;
  }

  // Clear only currencies cache (call this when currencies are added/updated/deleted)
  clearCurrenciesCache(): void {
    this.currenciesCache = null;
  }

  /**
   * Get FX rates for all supported currency pairs
   * Returns rates in both directions for each pair
   */
  async getAllPairsRates(): Promise<any> {
    const activeCurrencies = await this.getActiveCurrencies();
    
    const pairs = [];
    
    // Generate all unique pairs
    for (let i = 0; i < activeCurrencies.length; i++) {
      for (let j = i + 1; j < activeCurrencies.length; j++) {
        const base = activeCurrencies[i];
        const quote = activeCurrencies[j];
        
        try {
          const forwardRate = await this.getRate(base.code, quote.code);
          const reverseRate = await this.getRate(quote.code, base.code);
          
          pairs.push({
            pair: `${base.code}/${quote.code}`,
            base: base.code,
            quote: quote.code,
            rate: forwardRate[quote.code],
          });
          
          pairs.push({
            pair: `${quote.code}/${base.code}`,
            base: quote.code,
            quote: base.code,
            rate: reverseRate[base.code],
          });
        } catch (error) {
          console.error(`Error fetching rate for ${base.code}/${quote.code}:`, error.message);
        }
      }
    }
    
    return {
      pairs,
      totalPairs: pairs.length,
      timestamp: new Date().toISOString(),
    };
  }
}
