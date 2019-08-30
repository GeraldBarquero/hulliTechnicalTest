import { InvoiceService } from './invoice.service';
import { Invoice } from '../entities/invoice';
import { PayInvoice } from '../entities/invoice';
export declare class InvoiceController {
    private invoiceService;
    constructor(invoiceService: InvoiceService);
    getValue(id: any, response: any): void;
    createInvoice(newInvoice: Invoice, response: any): void;
    payInvoice(id: any, newPay: PayInvoice, response: any): void;
    getAll(response: any): void;
    deleteInvoice(id: any, response: any): void;
}
