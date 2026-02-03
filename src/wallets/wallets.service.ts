import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Balance } from './entities/balance.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Currency } from '../common/enums/currency.enum';
import { TransactionType } from '../common/enums/transaction-type.enum';
import { TransactionStatus } from '../common/enums/transaction-status.enum';
import { FxRatesService } from '../fx-rates/fx-rates.service';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private fxRatesService: FxRatesService,
    private dataSource: DataSource,
  ) {}

  async getWallet(userId: string) {
    const wallet = await this.walletRepository.findOne({
      where: { userId },
      relations: ['balances'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Format balances for response
    const balances = {};
    wallet.balances.forEach((balance) => {
      balances[balance.currency] = balance.amount;
    });

    return {
      walletId: wallet.id,
      userId: wallet.userId,
      balances,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  async fundWallet(userId: string, fundWalletDto: FundWalletDto) {
    const { currency, amount } = fundWalletDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get wallet
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // Get or create balance for currency
      let balance = await queryRunner.manager.findOne(Balance, {
        where: { walletId: wallet.id, currency },
        lock: { mode: 'pessimistic_write' },
      });

      if (!balance) {
        balance = queryRunner.manager.create(Balance, {
          walletId: wallet.id,
          currency,
          amount: 0,
        });
      }

      // Update balance
      const newAmount = balance.amount + amount;
      balance.amount = newAmount;

      await queryRunner.manager.save(balance);

      // Create transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        type: TransactionType.FUNDING,
        toCurrency: currency,
        toAmount: amount.toString(),
        status: TransactionStatus.COMPLETED,
        metadata: {
          previousBalance: balance.amount - amount,
          newBalance: newAmount,
        },
      });

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      return {
        message: 'Wallet funded successfully',
        transaction: {
          id: transaction.id,
          type: transaction.type,
          currency,
          amount,
          newBalance: newAmount,
          timestamp: transaction.createdAt,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async convertCurrency(userId: string, convertDto: ConvertCurrencyDto) {
    const { fromCurrency, toCurrency, amount } = convertDto;

    if (fromCurrency === toCurrency) {
      throw new BadRequestException('Cannot convert to the same currency');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get wallet
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // Get exchange rate
      const exchangeRate = await this.fxRatesService.getRate(
        fromCurrency,
        toCurrency,
      );

      // Get source balance with pessimistic lock
      const fromBalance = await queryRunner.manager.findOne(Balance, {
        where: { walletId: wallet.id, currency: fromCurrency },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromBalance || fromBalance.amount < amount) {
        throw new BadRequestException(
          `Insufficient ${fromCurrency} balance. Available: ${fromBalance ? fromBalance.amount : 0}`,
        );
      }

      // Get or create target balance with pessimistic lock
      let toBalance = await queryRunner.manager.findOne(Balance, {
        where: { walletId: wallet.id, currency: toCurrency },
        lock: { mode: 'pessimistic_write' },
      });

      if (!toBalance) {
        toBalance = queryRunner.manager.create(Balance, {
          walletId: wallet.id,
          currency: toCurrency,
          amount: 0,
        });
      }

      // Calculate converted amount
      const convertedAmount = amount * exchangeRate;

      // Update balances
      const newFromAmount = fromBalance.amount - amount;
      const newToAmount = toBalance.amount + convertedAmount;

      fromBalance.amount = newFromAmount;
      toBalance.amount = newToAmount;

      await queryRunner.manager.save(fromBalance);
      await queryRunner.manager.save(toBalance);

      // Create transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        type: TransactionType.CONVERSION,
        fromCurrency,
        toCurrency,
        fromAmount: amount.toString(),
        toAmount: convertedAmount.toString(),
        exchangeRate: exchangeRate.toString(),
        status: TransactionStatus.COMPLETED,
        metadata: {
          fromBalanceBefore: fromBalance.amount + amount,
          fromBalanceAfter: newFromAmount,
          toBalanceBefore: toBalance.amount - convertedAmount,
          toBalanceAfter: newToAmount,
        },
      });

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      return {
        message: 'Currency converted successfully',
        conversion: {
          id: transaction.id,
          from: {
            currency: fromCurrency,
            amount,
            newBalance: newFromAmount,
          },
          to: {
            currency: toCurrency,
            amount: convertedAmount,
            newBalance: newToAmount,
          },
          exchangeRate,
          timestamp: transaction.createdAt,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Trade is an alias for convert
  async trade(userId: string, convertDto: ConvertCurrencyDto) {
    const result = await this.convertCurrency(userId, convertDto);
    return {
      ...result,
      message: 'Trade executed successfully',
    };
  }
}
