import { DataSource } from 'typeorm';
import { DATA_SOURCE, CURRENCY_REPOSITORY } from '../../core/constants';
import { Currency } from '../../currencies/entities/currency.entity';

export const CurrencyRepoProvider = [
  {
    provide: CURRENCY_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Currency),
    inject: [DATA_SOURCE],
  },
];
