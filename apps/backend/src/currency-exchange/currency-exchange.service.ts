import { Injectable } from '@nestjs/common';
import axios from 'axios';

const apiAdapter = axios.create({
  baseURL: process.env.OPEN_EXCHANGE_RATES_HOST_URL,
  params: {
    app_id: process.env.OPEN_EXCHANGE_RATES_APP_ID,
  },
});

@Injectable()
export class CurrencyExchangeService {
  private exchangeRates: Record<string, number> = {};

  getLatestExchangeRates() {
    return this.exchangeRates;
  }

  async refreshExchangeRates() {
    const response = await apiAdapter.get('/latest.json');
    console.log(response.data);
  }
}
