import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvoiceService } from './invoice/invoice.service';
import { InvoiceController } from './invoice/invoice.controller';

@Module({
  imports: [],
  controllers: [AppController, InvoiceController],
  providers: [AppService, InvoiceService],
})
export class AppModule {}
