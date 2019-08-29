export declare class Invoice {
    id: number | 0;
    lines: Lines[];
    client: Client;
    tax_total: number | 0;
    discount_total: number | 0;
    subtotal: number | 0;
    total: number | 0;
    payments: Payments[];
    balance: 0;
}
export declare class Lines {
    product: string;
    quantity: number | 0;
    price: number | 0;
    price_crc: number | 0;
    tax_rate: number | 0;
    discount_rate: number | 0;
    currency: string;
}
export declare class Client {
    name: string;
    id: string;
}
export declare class PayInvoice {
    invoice_id: number;
    amount: number;
}
export declare class Payments {
    id: number;
    total: number;
}
