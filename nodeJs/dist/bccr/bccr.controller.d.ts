import { BccrService } from './bccr.service';
import { Invoice } from '../entities/invoice';
import { PayInvoice } from '../entities/invoice';
export declare class BccrController {
    private invoiceService;
    constructor(invoiceService: BccrService);
    getValue(id: any, response: any): void;
    createInvoice(newInvoice: Invoice, response: any): void;
    payInvoice(id: any, newPay: PayInvoice, response: any): void;
    getAll(response: any): void;
    deleteInvoice(id: any, response: any): void;
}
