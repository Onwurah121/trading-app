import { Module } from '@nestjs/common';
import { DatabaseProvider } from './providers/database.provider';
import { UserRepoProvider } from './providers/user.repository.provider';
import { WalletRepoProvider } from './providers/wallet.repository.provider';
import { BalanceRepoProvider } from './providers/balance.repository.provider';
import { TransactionRepoProvider } from './providers/transaction.repository.provider';
import { CurrencyRepoProvider } from './providers/currency.repository.provider';

@Module({
  providers: [
    ...DatabaseProvider,
    ...UserRepoProvider,
    ...WalletRepoProvider,
    ...BalanceRepoProvider,
    ...TransactionRepoProvider,
    ...CurrencyRepoProvider,
  ],
  exports: [
    ...DatabaseProvider,
    ...UserRepoProvider,
    ...WalletRepoProvider,
    ...BalanceRepoProvider,
    ...TransactionRepoProvider,
    ...CurrencyRepoProvider,
  ],
})
export class RepositoryModule {}
