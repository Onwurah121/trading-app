import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard, VerifiedUserGuard)
@ApiBearerAuth()
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wallet with all currency balances' })
  @ApiResponse({ status: 200, description: 'Returns wallet information' })
  async getWallet(@CurrentUser() user: User) {
    return this.walletsService.getWallet(user.id);
  }

  @Post('fund')
  @ApiOperation({ summary: 'Fund wallet in any supported currency' })
  @ApiResponse({ status: 201, description: 'Wallet funded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async fundWallet(
    @CurrentUser() user: User,
    @Body() fundWalletDto: FundWalletDto,
  ) {
    return this.walletsService.fundWallet(user.id, fundWalletDto);
  }

  @Post('convert')
  @ApiOperation({ summary: 'Convert between currencies using real-time FX rates' })
  @ApiResponse({ status: 201, description: 'Currency converted successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient balance or invalid request' })
  async convertCurrency(
    @CurrentUser() user: User,
    @Body() convertDto: ConvertCurrencyDto,
  ) {
    return this.walletsService.convertCurrency(user.id, convertDto);
  }

  @Post('trade')
  @ApiOperation({ summary: 'Trade currencies (alias for convert)' })
  @ApiResponse({ status: 201, description: 'Trade executed successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient balance or invalid request' })
  async trade(
    @CurrentUser() user: User,
    @Body() convertDto: ConvertCurrencyDto,
  ) {
    return this.walletsService.trade(user.id, convertDto);
  }
}
