export class ExchangeRate {
  public readonly code!: string;
  public readonly name!: string;
  public readonly rate!: number;
  public readonly change!: number;
}

export class LatestExchangeRates {
  public readonly rates!: ExchangeRate[];
  public readonly lastUpdatedAt!: number;
  public readonly base!: string;
}

export type CurrencyExchangeRateChanges = {
  [currencyCode: string]: {
    code: string;
    name: string;
    rate: number;
    change: number;
  };
};
