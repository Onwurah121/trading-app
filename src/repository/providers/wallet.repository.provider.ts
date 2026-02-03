import { DataSource } from 'typeorm';
import { DATA_SOURCE, WALLET_REPOSITORY } from '../../core/constants';
import { Wallet } from '../../wallets/entities/wallet.entity';

export const WalletRepoProvider = [
  {
    provide: WALLET_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Wallet),
    inject: [DATA_SOURCE],
  },
];
