import io from 'socket.io-client';

export const initSocketConnection = async () => {
  const socket = io('http://localhost:5000'); // TODO: Move to config/env

  socket.on('connect', () => {
    console.log('Connected');
  });
  socket.on('currencyExchangeRates', function (data) {
    console.log('event', data);
  });
  socket.on('currencyExchangeRatesUpdate', function (data) {
    console.log('event', data);
  });
  socket.on('disconnect', function () {
    console.log('Disconnected');
  });
};
