import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { Wallet } from './entities/wallet.entity';
import { Balance } from './entities/balance.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { FxRatesModule } from '../fx-rates/fx-rates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Balance, Transaction]),
    FxRatesModule,
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
