import { Injectable } from '@nestjs/common';
import { Invoice, Payments, PayInvoice } from '../entities/invoice';
var soap = require('soap');
var parseString = require('xml-js');
var dateFormat = require('dateformat');
@Injectable()
export class InvoiceService {
    private readonly invoices: Invoice[] = [];
    private maxId: number = 0;
    private maxIdPay: number = 0;

    async getCurrencyValueSale(){
        var day=dateFormat(new Date(), "dd/mm/yyyy");
        var resultWs = '';
        var url = 'https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx?WSDL';
        var args = {Indicador: '318', 
                    FechaInicio: day, 
                    FechaFinal: day, 
                    Nombre: 'Gerald Barquero', 
                    SubNiveles: 'S', 
                    CorreoElectronico: 'gerald.bv1@gmail.com',
                    Token: 'MURL8ALAGA'};
        await soap.createClientAsync(url).then((client) => {
            resultWs = client.ObtenerIndicadoresEconomicosXMLAsync(args).then((e) => {
                var xmlRequest = e[1];
                const stringRequest = parseString.xml2json(xmlRequest, {compact: true, spaces: 4});
                const jsonRequest = JSON.parse(stringRequest);
                const xmlINDICA = jsonRequest['soap:Envelope']['soap:Body']['ObtenerIndicadoresEconomicosXMLResponse']['ObtenerIndicadoresEconomicosXMLResult']['_text']
                const stringINDICA = parseString.xml2json(xmlINDICA, {compact: true, spaces: 4});
                const jsonSALE = JSON.parse(stringINDICA);
                const value = jsonSALE['Datos_de_INGC011_CAT_INDICADORECONOMIC']['INGC011_CAT_INDICADORECONOMIC']['NUM_VALOR']['_text'];
                return value;
            });
        });
        return resultWs;
    }

    async calculatePriceCRC(price: number){
        let saleValue: number = 0;
        console.log(price);
        await this.getCurrencyValueSale().then( result => {
            saleValue = parseFloat(result);
        })
        console.log(saleValue);
        return price * saleValue;

    }
    
    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    async createInvoice( data: Invoice){
        let newInvoice = new Invoice();
        this.maxId ++;
        newInvoice.id = this.maxId;
        newInvoice.lines = data.lines;
        newInvoice.client = data.client;
        newInvoice.tax_total = 0;
        newInvoice.discount_total = 0;
        newInvoice.subtotal = 0;
        newInvoice.total = 0;
        newInvoice.balance = 0;
        newInvoice.payments = [];
        await this.asyncForEach(newInvoice.lines, async(e) =>{
            let lastPrice = 0;
            if (e.currency !== 'CRC'){

                await this.getCurrencyValueSale().then( result => {
                    e.price_crc = e.price * parseFloat(result);
                })
                lastPrice = e.price_crc;
            }else{
                lastPrice = e.price;
            }
            let priceWithDiscount = lastPrice * (e.discount_rate/100);
            let priceWithTaxt = lastPrice * (e.tax_rate/100);
            newInvoice.tax_total += priceWithTaxt;
            newInvoice.discount_total += priceWithDiscount;
            newInvoice.subtotal += lastPrice;
            newInvoice.total = newInvoice.subtotal - priceWithDiscount + priceWithTaxt;
        })
        newInvoice.balance -= newInvoice.total;

        await this.invoices.push(newInvoice);
        return this.invoices;
    }

    async getAllInvoice(){
        return this.invoices;
    }

    async getOneInvoice(id: number){
        let newInvoice = new Invoice();
        await this.asyncForEach(this.invoices, async(e) => {
            if (e.id == id ){
                newInvoice = e;
            }
        })

        return newInvoice;
    }

    async payInvoice(id: number, payIn: PayInvoice){
        await this.asyncForEach(this.invoices, async(e) => {
            if (e.id == id && e.balance < 0){
                let newBalance = e.balance + payIn.amount;
                if (newBalance < 0){
                    let pay = new Payments();
                    this.maxIdPay ++;
                    pay.id = this.maxIdPay;
                    pay.total = payIn.amount;
                    e.payments.push(pay);
                    e.balance += pay.total;
                    return;
                }
            }
        })
        return this.invoices;
    }

    async DeleteInvoice(id: number){
        console.log(id)
        await this.invoices.forEach((e,i) => {
            console.log(e)
            if(e.id == id ){
                this.invoices.splice(i,1);
            }
        });
        return this.invoices;
    }
}
