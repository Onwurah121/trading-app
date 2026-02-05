import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';

@Controller('wallet')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @Get()
  async getWallet(@CurrentUser() user: User) {
    return this.walletsService.getWallet(user.id);
  }

  @Post('fund')
  async fundWallet(
    @Body() fundWalletDto: FundWalletDto,
  ) {
    return this.walletsService.fundWallet(fundWalletDto);
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @Post('convert')
  async convertCurrency(
    @CurrentUser() user: User,
    @Body() convertDto: ConvertCurrencyDto,
  ) {
    return this.walletsService.convertCurrency(user.id, convertDto);
  }
}
