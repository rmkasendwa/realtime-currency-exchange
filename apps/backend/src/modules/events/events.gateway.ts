import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CurrencyExchangeService } from '../currency-exchange/currency-exchange.service';
import { CurrencyExchangeRateChanges } from '../currency-exchange/models';
import { UserPayload } from '../../types';

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
    private readonly jwtService: JwtService,
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
    try {
      // We can use this method to authenticate the socket connection.
      // Disabled to keep the assignment simple. Not to run down the rabbit hole.
      // const user = this.authenticateSocket(socket);
      this.connectedClients.push(socket);
      this.logger.log(`Client connected: ${socket.id}`);
      const exchangeRates =
        await this.currencyExchangeService.getCurrentExchangeRates();
      this.toggleExchangeRatesRefresh();
      socket.emit('currencyExchangeRates', exchangeRates);
    } catch (error) {
      this.handleConnectionError(socket, error);
    }
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

  private extractJwtToken(socket: Socket): string {
    const authHeader = socket.handshake.headers.authorization;
    if (!authHeader)
      throw new UnauthorizedException('No authorization header found');

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token)
      throw new UnauthorizedException('Invalid or missing token');

    return token;
  }

  private authenticateSocket(socket: Socket): UserPayload {
    const token = this.extractJwtToken(socket);
    return this.jwtService.verify<UserPayload>(token, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
  }

  private handleConnectionError(socket: Socket, error: Error): void {
    this.logger.error(
      `Connection error for socket ${socket.id}: ${error.message}`
    );
    socket.emit('exception', 'Authentication error');
    socket.disconnect();
  }
}
