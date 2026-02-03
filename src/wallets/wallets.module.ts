import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { FxRatesModule } from '../fx-rates/fx-rates.module';
import { RepositoryModule } from '../repository/repository.module';

@Module({
  imports: [RepositoryModule, FxRatesModule],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
