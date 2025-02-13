import { Module } from '@nestjs/common';
import { CurrencyExchangeService } from '../currency-exchange/currency-exchange.service';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway, CurrencyExchangeService],
})
export class EventsModule {}
