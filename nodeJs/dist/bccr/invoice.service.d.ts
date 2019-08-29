import { Invoice, PayInvoice } from '../entities/invoice';
export declare class BccrService {
    private readonly invoices;
    private maxId;
    private maxIdPay;
    getCurrencyValueSale(): Promise<string>;
    calculatePriceCRC(price: number): Promise<number>;
    asyncForEach(array: any, callback: any): Promise<void>;
    createInvoice(data: Invoice): Promise<Invoice[]>;
    getAllInvoice(): Promise<Invoice[]>;
    payInvoice(id: number, payIn: PayInvoice): Promise<Invoice[]>;
    DeleteInvoice(id: number): Promise<Invoice[]>;
}
