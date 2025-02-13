import { z } from 'zod';

export class ExchangeRate {
  public readonly code: string;
  public readonly name: string;
  public readonly rate: number;
  public readonly change: number;
}

export class LatestExchangeRates {
  public readonly rates: ExchangeRate[];
  public readonly lastUpdatedAt: number;
  public readonly base: string;
}

export const LatestOpenExchangeRatesValidationSchema = z.object({
  disclaimer: z.string().nullish(),
  license: z.string().nullish(),
  timestamp: z.number(),
  base: z.string(),
  rates: z.record(z.number()),
});

export type LatestOpenExchangeRates = z.infer<
  typeof LatestOpenExchangeRatesValidationSchema
>;

export const OpenExchangeRatesCurrenciesValidationSchema = z.record(z.string());

export type CurrencyExchangeFetchOptions = {
  random?: boolean;
};

export type CurrencyExchangeRateChanges = {
  [currencyCode: string]: {
    code: string;
    name: string;
    rate: number;
    change: number;
  };
};
