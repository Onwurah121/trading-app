import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { GetTransactionsDto } from './dto/get-transactions.dto';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, VerifiedUserGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get transaction history with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Returns transaction history' })
  async getTransactions(
    @CurrentUser() user: User,
    @Query() query: GetTransactionsDto,
  ) {
    return this.transactionsService.getTransactions(user.id, query);
  }
}
