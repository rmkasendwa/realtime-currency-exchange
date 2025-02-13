import { Injectable } from '@nestjs/common';
import { CurrencyExchangeService } from '../currency-exchange/currency-exchange.service';

@Injectable()
export class AppService {
  constructor(private currencyExchangeService: CurrencyExchangeService) {}

  async getData() {
    return this.currencyExchangeService.getCurrentExchangeRates({
      random: true,
    });
  }
}
