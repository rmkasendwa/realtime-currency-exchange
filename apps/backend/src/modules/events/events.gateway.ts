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

/**
 * WebSocket gateway for handling real-time currency exchange events.
 *
 * @WebSocketGateway - Configures the WebSocket gateway with CORS settings.
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  /**
   * WebSocket server instance.
   */
  @WebSocketServer() server: Server;

  /**
   * Logger instance for logging gateway events.
   */
  private readonly logger = new Logger('EventsGateway');

  /**
   * List of connected clients. This would be replaced with a database in a real-world application.
   */
  private readonly connectedClients: Socket[] = [];

  /**
   * Interval for refreshing exchange rates (in milliseconds).
   */
  private readonly exchangeRatesRefreshInterval = 10000;

  /**
   * Timeout for scheduling the next exchange rates refresh.
   */
  private exchangeRatesRefreshTimeout: NodeJS.Timeout;

  /**
   * Constructor for EventsGateway.
   *
   * @param jwtService - Service for handling JWT operations.
   * @param currencyExchangeService - Service for handling currency exchange operations.
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly currencyExchangeService: CurrencyExchangeService
  ) {}

  /**
   * Lifecycle hook that is called when the module is initialized.
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('ChatGateway initialized');
  }

  /**
   * Lifecycle hook that is called when the module is destroyed.
   */
  async onModuleDestroy(): Promise<void> {
    clearTimeout(this.exchangeRatesRefreshInterval);
    this.logger.log('ChatGateway destroyed');
  }

  /**
   * Handles a new client connection.
   *
   * @param socket - The connected client socket.
   */
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

  /**
   * Handles client disconnection.
   *
   * @param socket - The disconnected client socket.
   */
  async handleDisconnect(socket: Socket): Promise<void> {
    this.connectedClients.splice(this.connectedClients.indexOf(socket), 1);
    this.toggleExchangeRatesRefresh();
    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  /**
   * Toggles the exchange rates refresh based on the number of connected clients.
   */
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

  /**
   * Refreshes the exchange rates and broadcasts the changes to connected clients.
   */
  private async refreshExchangeRates() {
    const exchangeRateChanges =
      await this.currencyExchangeService.updateExchangeRates({ random: true });
    if (exchangeRateChanges) {
      this.broadcastExchangeRateChanges(exchangeRateChanges);
    }
    this.toggleExchangeRatesRefresh();
  }

  /**
   * Broadcasts exchange rate changes to all connected clients.
   *
   * @param exchangeRateChanges - The changes in exchange rates.
   */
  private async broadcastExchangeRateChanges(
    exchangeRateChanges: CurrencyExchangeRateChanges
  ) {
    this.server.emit('currencyExchangeRatesUpdate', exchangeRateChanges);
  }

  /**
   * Extracts the JWT token from the socket's authorization header.
   *
   * @param socket - The client socket.
   * @returns The extracted JWT token.
   * @throws UnauthorizedException if the authorization header is missing or invalid.
   */
  private extractJwtToken(socket: Socket): string {
    const authHeader = socket.handshake.headers.authorization;
    if (!authHeader)
      throw new UnauthorizedException('No authorization header found');

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token)
      throw new UnauthorizedException('Invalid or missing token');

    return token;
  }

  /**
   * Authenticates the socket connection using JWT.
   *
   * @param socket - The client socket.
   * @returns The authenticated user payload.
   */
  private authenticateSocket(socket: Socket): UserPayload {
    const token = this.extractJwtToken(socket);
    return this.jwtService.verify<UserPayload>(token, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
  }

  /**
   * Handles connection errors by logging the error and disconnecting the socket.
   *
   * @param socket - The client socket.
   * @param error - The error that occurred.
   */
  private handleConnectionError(socket: Socket, error: Error): void {
    this.logger.error(
      `Connection error for socket ${socket.id}: ${error.message}`
    );
    socket.emit('exception', 'Authentication error');
    socket.disconnect();
  }
}
