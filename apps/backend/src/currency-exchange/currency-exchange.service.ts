import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { handleZodParse } from '../utils/zod';
import {
  CurrencyExchangeFetchOptions,
  CurrencyExchangeRateChanges,
  LatestExchangeRates,
  LatestOpenExchangeRates,
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
  private readonly baseCurrency = 'USD';
  private currencies: Record<string, string> = {};
  private prevExchangeRates: Record<string, number> = {};
  private exchangeRates: LatestExchangeRates;

  async getCurrentExchangeRates({
    random = false,
  }: CurrencyExchangeFetchOptions = {}) {
    if (!this.exchangeRates) {
      await this.updateExchangeRates({
        random,
      });
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

  async randomlyGenerateLatestExchangeRates() {
    if (!this.currencies) {
      await this.updateCurrencies();
    }

    const rates: Record<string, number> = {};
    for (const currencyCode of Object.keys(this.currencies)) {
      if (currencyCode === this.baseCurrency) {
        continue;
      }
      rates[currencyCode] = Math.random() * 100;
    }

    return {
      rates,
      timestamp: Date.now(),
      base: this.baseCurrency,
    } satisfies LatestOpenExchangeRates;
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

  async updateExchangeRates({
    random = false,
  }: CurrencyExchangeFetchOptions = {}): Promise<
    CurrencyExchangeRateChanges | undefined
  > {
    if (Object.keys(this.currencies).length === 0) {
      await this.updateCurrencies();
    }
    const { rates, timestamp, base } = await (async () => {
      if (random) {
        return this.randomlyGenerateLatestExchangeRates();
      }
      return this.getLatestOpenExchangeRates();
    })();

    this.exchangeRates = {
      lastUpdatedAt: timestamp,
      base,
      rates: Object.entries(rates)
        .map(([code, rate]) => ({
          name: this.currencies[code],
          code,
          rate,
          change:
            this.prevExchangeRates?.[code] != null
              ? rate - this.prevExchangeRates[code]
              : 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };

    this.prevExchangeRates = rates;

    const exchangeRateChanges = this.exchangeRates.rates.filter(
      ({ change }) => {
        return change !== 0;
      }
    );

    if (exchangeRateChanges.length > 0) {
      return Object.fromEntries(
        exchangeRateChanges.map(({ code, name, change, rate }) => {
          return [
            code,
            {
              code,
              name,
              change,
              rate,
            },
          ];
        })
      );
    }
  }
}
