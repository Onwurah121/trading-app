import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { GetTransactionsDto } from './dto/get-transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getTransactions(userId: string, query: GetTransactionsDto) {
    const { type, status, startDate, endDate, page = 1, limit = 20 } = query;

    const where: FindOptionsWhere<Transaction> = { userId };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.createdAt = Between(new Date(startDate), new Date());
    }

    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where,
        order: { createdAt: 'DESC' },
        take: limit,
        skip: (page - 1) * limit,
      },
    );

    // Format transactions for response
    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      fromCurrency: tx.fromCurrency,
      toCurrency: tx.toCurrency,
      fromAmount: tx.fromAmount ? parseFloat(tx.fromAmount) : null,
      toAmount: tx.toAmount ? parseFloat(tx.toAmount) : null,
      exchangeRate: tx.exchangeRate ? parseFloat(tx.exchangeRate) : null,
      status: tx.status,
      metadata: tx.metadata,
      createdAt: tx.createdAt,
    }));

    return {
      transactions: formattedTransactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
