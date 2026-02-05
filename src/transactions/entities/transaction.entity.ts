import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Currency } from '../../common/enums/currency.enum';
import { TransactionType } from '../../common/enums/transaction-type.enum';
import { TransactionStatus } from '../../common/enums/transaction-status.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  fromCurrency: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  toCurrency: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    nullable: true,
  })
  fromAmount: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    nullable: true,
  })
  toAmount: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    nullable: true,
  })
  exchangeRate: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
