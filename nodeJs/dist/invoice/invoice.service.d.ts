import { Invoice, PayInvoice } from '../entities/invoice';
export declare class InvoiceService {
    private readonly invoices;
    private maxId;
    private maxIdPay;
    getCurrencyValueSale(): Promise<string>;
    calculatePriceCRC(price: number): Promise<number>;
    asyncForEach(array: any, callback: any): Promise<void>;
    createInvoice(data: Invoice): Promise<Invoice[]>;
    getAllInvoice(): Promise<Invoice[]>;
    getOneInvoice(id: number): Promise<Invoice>;
    payInvoice(id: number, payIn: PayInvoice): Promise<Invoice[]>;
    DeleteInvoice(id: number): Promise<Invoice[]>;
}
