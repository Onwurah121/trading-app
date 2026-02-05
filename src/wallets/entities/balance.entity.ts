import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { Currency } from '../../common/enums/currency.enum';

@Entity('balances')
@Index(['walletId', 'currency'], { unique: true })
export class Balance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  walletId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.balances)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column({
    type: 'varchar',
  })
  currency: string;

  @Column({
    type: 'integer',
    default: 0,
  })
  amount: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
