import { Controller, Get, Res, HttpStatus, Param, Post, Body, Delete } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Invoice } from '../entities/invoice';
import { PayInvoice } from '../entities/invoice';

@Controller('invoice')
export class InvoiceController {
    constructor(private invoiceService: InvoiceService) {

    }

    @Get(':id')
    getValue(@Param('id') id,@Res() response) {
        this.invoiceService.getOneInvoice(id).then( token => {
            console.log(token);
            response.status(HttpStatus.OK).json(token);
        }).catch( (e) => {
            response.status(HttpStatus.OK).json(e);
        });
    }

    @Post()
    createInvoice(@Body() newInvoice: Invoice, @Res() response) {
        this.invoiceService.createInvoice(newInvoice).then( result => {
            response.status(HttpStatus.CREATED).json(result);
        }).catch( (e) => {
            response.status(HttpStatus.OK).json(e);
        });
    }

    @Post(':id')
    payInvoice(@Param('id') id, @Body() newPay: PayInvoice, @Res() response) {
        this.invoiceService.payInvoice(id, newPay).then( result => {
            response.status(HttpStatus.CREATED).json(result);
        }).catch( (e) => {
            response.status(HttpStatus.OK).json(e);
        });
    }

    @Get()
    getAll(@Res() response) {
        this.invoiceService.getAllInvoice().then( list => {
            response.status(HttpStatus.OK).json(list);
        }).catch( (e) => {
            response.status(HttpStatus.OK).json(e);
        });
    }

    @Delete(':id')
    deleteInvoice(@Param('id') id, @Res() response) {
        this.invoiceService.DeleteInvoice(id).then( result => {
            response.status(HttpStatus.CREATED).json(result);
        }).catch( (e) => {
            response.status(HttpStatus.OK).json(e);
        });
    }
}
