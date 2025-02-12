import io from 'socket.io-client';

export const initSocketConnection = async () => {
  const socket = io('http://localhost:5000'); // TODO: Move to config/env

  socket.on('connect', function () {
    console.log('Connected');

    socket.emit('events', { test: 'test' });
    socket.emit('identity', 0, (response: any) =>
      console.log('Identity:', response)
    );
  });
  socket.on('events', function (data) {
    console.log('event', data);
  });
  socket.on('exception', function (data) {
    console.log('event', data);
  });
  socket.on('disconnect', function () {
    console.log('Disconnected');
  });
};
