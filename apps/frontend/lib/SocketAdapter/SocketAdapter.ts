import io from 'socket.io-client';
import { CurrencyExchangeRateChanges, LatestExchangeRates } from '../../models';

export type SocketConnectionOptions = {
  onCurrencyExchangeRates?: (data: LatestExchangeRates) => void;
  onCurrencyExchangeRatesUpdate?: (data: CurrencyExchangeRateChanges) => void;
};

export const initSocketConnection = async ({
  onCurrencyExchangeRates,
  onCurrencyExchangeRatesUpdate,
}: SocketConnectionOptions = {}) => {
  const socket = io('http://localhost:5000'); // TODO: Move to config/env

  socket.on('connect', () => {
    console.log('Connected');
  });
  socket.on('currencyExchangeRates', (data: LatestExchangeRates) => {
    onCurrencyExchangeRates?.(data);
  });
  socket.on(
    'currencyExchangeRatesUpdate',
    (data: CurrencyExchangeRateChanges) => {
      onCurrencyExchangeRatesUpdate?.(data);
    }
  );
  socket.on('disconnect', function () {
    console.log('Disconnected');
  });

  return {
    socket,
  };
};
