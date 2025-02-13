import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { handleZodParse } from '../utils/zod';
import {
  LatestExchangeRates,
  LatestOpenExchangeRatesValidationSchema,
  OpenExchangeRatesCurrenciesValidationSchema,
} from './models';

const apiAdapter = axios.create({
  baseURL: process.env.OPEN_EXCHANGE_RATES_HOST_URL,
  params: {
    app_id: process.env.OPEN_EXCHANGE_RATES_APP_ID,
  },
});

@Injectable()
export class CurrencyExchangeService {
  private currencies: Record<string, string> = {};
  private prevExchangeRates: Record<string, number> = {};
  private exchangeRates: LatestExchangeRates;

  async getCurrentExchangeRates() {
    if (!this.exchangeRates) {
      await this.updateExchangeRates();
    }
    return this.exchangeRates;
  }

  async getLatestOpenExchangeRates() {
    const response = await apiAdapter.get('/latest.json');
    return handleZodParse(
      LatestOpenExchangeRatesValidationSchema,
      response.data
    );
  }

  async findAllCurrencies() {
    const response = await apiAdapter.get('/currencies.json');
    return handleZodParse(
      OpenExchangeRatesCurrenciesValidationSchema,
      response.data
    );
  }

  async updateCurrencies() {
    this.currencies = await this.findAllCurrencies();
  }

  async updateExchangeRates() {
    if (Object.keys(this.currencies).length === 0) {
      await this.updateCurrencies();
    }
    const { rates, timestamp, base } = await this.getLatestOpenExchangeRates();

    this.exchangeRates = {
      lastUpdatedAt: timestamp,
      base,
      rates: Object.entries(rates)
        .map(([currencyCode, rate]) => ({
          currencyName: this.currencies[currencyCode],
          currencyCode,
          rate,
          change:
            this.prevExchangeRates?.[currencyCode] != null
              ? rate - this.prevExchangeRates[currencyCode]
              : 0,
        }))
        .sort((a, b) => a.currencyName.localeCompare(b.currencyName)),
    };

    this.prevExchangeRates = rates;
  }
}
