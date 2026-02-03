import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DATA_SOURCE } from '../../core/constants';
import { User } from '../../users/entities/user.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { Balance } from '../../wallets/entities/balance.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

export const DatabaseProvider = [
  {
    provide: DATA_SOURCE,
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [User, Wallet, Balance, Transaction],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      });

      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
