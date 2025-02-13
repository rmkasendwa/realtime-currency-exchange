import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Socket } from 'socket.io-client';
import { CurrencyExchangeService } from '../currency-exchange/currency-exchange.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('EventsGateway');

  constructor(
    private readonly currencyExchangeService: CurrencyExchangeService
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('ChatGateway initialized');
  }

  async handleConnection(socket: Socket) {
    this.logger.log(`Client connected: ${socket.id}`);
    const exchangeRates =
      await this.currencyExchangeService.getCurrentExchangeRates();
    socket.emit('currencyExchangeRatesUpdate', exchangeRates);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    this.logger.log(`Client disconnected: ${socket.id}`);
  }
}
