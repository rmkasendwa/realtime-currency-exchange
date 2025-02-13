import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { handleZodParse } from '../../utils/zod';
import {
  CurrencyExchangeFetchOptions,
  CurrencyExchangeRateChanges,
  LatestExchangeRates,
  LatestOpenExchangeRates,
  LatestOpenExchangeRatesValidationSchema,
  OpenExchangeRatesCurrenciesValidationSchema,
} from './models';

const apiAdapter = axios.create({
  baseURL:
    process.env.OPEN_EXCHANGE_RATES_HOST_URL ??
    'https://openexchangerates.org/api',
  params: {
    app_id: process.env.OPEN_EXCHANGE_RATES_APP_ID,
  },
});

/**
 * @class CurrencyExchangeService
 * @description Service to handle currency exchange operations.
 */
@Injectable()
export class CurrencyExchangeService {
  /**
   * @private
   * @readonly
   * @description The base currency for exchange rates.
   */
  private readonly baseCurrency = 'USD';

  /**
   * @private
   * @description A record of currency codes and their names.
   */
  private currencies: Record<string, string> = {};

  /**
   * @private
   * @description A record of previous exchange rates.
   */
  private prevExchangeRates: Record<string, number> = {};

  /**
   * @private
   * @description The latest exchange rates.
   */
  private exchangeRates: LatestExchangeRates;

  /**
   * @async
   * @method getCurrentExchangeRates
   * @description Fetches the current exchange rates. If exchange rates are not available, it updates them.
   * @param {CurrencyExchangeFetchOptions} [options] - Options for fetching exchange rates.
   * @returns {Promise<LatestExchangeRates>} The current exchange rates.
   */
  async getCurrentExchangeRates({
    random = false,
  }: CurrencyExchangeFetchOptions = {}): Promise<LatestExchangeRates> {
    if (!this.exchangeRates) {
      await this.updateExchangeRates({
        random,
      });
    }
    return this.exchangeRates;
  }

  /**
   * @async
   * @method getLatestOpenExchangeRates
   * @description Fetches the latest exchange rates from the Open Exchange Rates API.
   * @returns {Promise<LatestOpenExchangeRates>} The latest exchange rates.
   */
  async getLatestOpenExchangeRates(): Promise<LatestOpenExchangeRates> {
    const response = await apiAdapter.get('/latest.json');
    return handleZodParse(
      LatestOpenExchangeRatesValidationSchema,
      response.data
    );
  }

  /**
   * @async
   * @method randomlyGenerateLatestExchangeRates
   * @description Randomly generates the latest exchange rates based on the current rates.
   * This is useful for testing purposes.
   * @returns {Promise<LatestOpenExchangeRates>} The randomly generated exchange rates.
   */
  async randomlyGenerateLatestExchangeRates(): Promise<LatestOpenExchangeRates> {
    // Ensure the currencies are updated if not already available
    if (!this.currencies) {
      await this.updateCurrencies();
    }

    // Get the base rates either from the latest exchange rates or generate them if not available
    const baseRates = await (async () => {
      if (!this.exchangeRates) {
        const { rates } = await this.getLatestOpenExchangeRates();

        return Object.entries(rates).map(([code, rate]) => {
          return {
            code,
            rate,
          };
        });
      }
      return this.exchangeRates.rates.map(({ code, rate }) => {
        return {
          code,
          rate,
        };
      });
    })();

    // Generate random exchange rates based on the base rates
    const rates: Record<string, number> = {};
    for (const rate of baseRates) {
      // Randomly generate exchange rates with a 5% deviation from the base rates
      rates[rate.code] = rate.rate * (1 + (Math.random() * 0.1 - 0.05));
    }

    // Return the randomly generated exchange rates with the current timestamp and base currency
    return {
      rates,
      timestamp: Date.now(),
      base: this.baseCurrency,
    } satisfies LatestOpenExchangeRates;
  }

  /**
   * @async
   * @method findAllCurrencies
   * @description Fetches all available currencies from the Open Exchange Rates API.
   * @returns {Promise<Record<string, string>>} A record of currency codes and their names.
   */
  async findAllCurrencies(): Promise<Record<string, string>> {
    const response = await apiAdapter.get('/currencies.json');
    return handleZodParse(
      OpenExchangeRatesCurrenciesValidationSchema,
      response.data
    );
  }

  /**
   * @async
   * @method updateCurrencies
   * @description Updates the list of available currencies.
   */
  async updateCurrencies() {
    this.currencies = await this.findAllCurrencies();
  }

  /**
   * @async
   * @method updateExchangeRates
   * @description Updates the exchange rates. If the random option is set, it generates random exchange rates.
   * @param {CurrencyExchangeFetchOptions} [options] - Options for updating exchange rates.
   * @returns {Promise<CurrencyExchangeRateChanges | undefined>} The changes in exchange rates, if any.
   */
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
        exchangeRateChanges.map((exchangeRate) => {
          return [exchangeRate.code, exchangeRate];
        })
      );
    }
  }
}
