import { DataSource } from 'typeorm';
import { DATA_SOURCE, TRANSACTION_REPOSITORY } from '../../core/constants';
import { Transaction } from '../../transactions/entities/transaction.entity';

export const TransactionRepoProvider = [
  {
    provide: TRANSACTION_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Transaction),
    inject: [DATA_SOURCE],
  },
];
