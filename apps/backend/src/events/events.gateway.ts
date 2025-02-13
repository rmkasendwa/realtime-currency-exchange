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
import { CurrencyExchangeRateChanges } from '../currency-exchange/models';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('EventsGateway');
  private readonly connectedClients: Socket[] = [];
  private readonly exchangeRatesRefreshInterval = 10000;
  private exchangeRatesRefreshTimeout: NodeJS.Timeout;

  constructor(
    private readonly currencyExchangeService: CurrencyExchangeService
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('ChatGateway initialized');
  }

  async onModuleDestroy(): Promise<void> {
    clearTimeout(this.exchangeRatesRefreshInterval);
    this.logger.log('ChatGateway destroyed');
  }

  async handleConnection(socket: Socket) {
    this.connectedClients.push(socket);
    this.logger.log(`Client connected: ${socket.id}`);
    const exchangeRates =
      await this.currencyExchangeService.getCurrentExchangeRates();
    this.toggleExchangeRatesRefresh();
    socket.emit('currencyExchangeRates', exchangeRates);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    this.connectedClients.splice(this.connectedClients.indexOf(socket), 1);
    this.toggleExchangeRatesRefresh();
    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  private toggleExchangeRatesRefresh() {
    if (this.connectedClients.length > 0) {
      if (!this.exchangeRatesRefreshTimeout) {
        this.logger.log('Scheduled exchange rates refresh');
        this.exchangeRatesRefreshTimeout = setTimeout(() => {
          this.exchangeRatesRefreshTimeout = null;
          this.refreshExchangeRates();
        }, this.exchangeRatesRefreshInterval);
      }
    } else {
      this.logger.log('No clients connected, stopping exchange rates refresh');
      clearTimeout(this.exchangeRatesRefreshTimeout);
      this.exchangeRatesRefreshTimeout = null;
    }
  }

  private async refreshExchangeRates() {
    const exchangeRateChanges =
      await this.currencyExchangeService.updateExchangeRates({ random: true });
    if (exchangeRateChanges) {
      this.broadcastExchangeRateChanges(exchangeRateChanges);
    }
    this.toggleExchangeRatesRefresh();
  }

  private async broadcastExchangeRateChanges(
    exchangeRateChanges: CurrencyExchangeRateChanges
  ) {
    this.server.emit('currencyExchangeRatesUpdate', exchangeRateChanges);
  }
}
