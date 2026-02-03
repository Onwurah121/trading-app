import { DataSource } from 'typeorm';
import { DATA_SOURCE, BALANCE_REPOSITORY } from '../../core/constants';
import { Balance } from '../../wallets/entities/balance.entity';

export const BalanceRepoProvider = [
  {
    provide: BALANCE_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Balance),
    inject: [DATA_SOURCE],
  },
];
