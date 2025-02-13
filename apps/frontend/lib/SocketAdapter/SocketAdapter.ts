import io from 'socket.io-client';
import { CurrencyExchangeRateChanges, LatestExchangeRates } from '../../models';
import { getDynamicClientEnvironmentVariables } from '../environment';

export type SocketConnectionOptions = {
  onCurrencyExchangeRates?: (data: LatestExchangeRates) => void;
  onCurrencyExchangeRatesUpdate?: (data: CurrencyExchangeRateChanges) => void;
};

export const initSocketConnection = async ({
  onCurrencyExchangeRates,
  onCurrencyExchangeRatesUpdate,
}: SocketConnectionOptions = {}) => {
  const { SOCKET_SERVER_HOST_URL } =
    await getDynamicClientEnvironmentVariables();

  const socket = io(SOCKET_SERVER_HOST_URL);

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
