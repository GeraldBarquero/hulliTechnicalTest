export class Invoice {
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

export class Lines {
    product: string;
    quantity: number | 0;
    price: number | 0;
    price_crc: number | 0;
    tax_rate: number | 0;
    discount_rate: number | 0;
    currency: string;
}

export class Client {
    name: string;
    id: string;
}
export class PayInvoice {
    invoice_id: number;
    amount: number;
}

export class Payments {
    id: number;
    total: number;
}