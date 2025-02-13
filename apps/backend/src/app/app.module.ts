import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrencyExchangeService } from '../currency-exchange/currency-exchange.service';

@Module({
  imports: [EventsModule],
  controllers: [AppController],
  providers: [AppService, CurrencyExchangeService],
})
export class AppModule {}
