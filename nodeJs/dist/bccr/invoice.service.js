"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const invoice_1 = require("../entities/invoice");
var soap = require('soap');
var parseString = require('xml-js');
let BccrService = class BccrService {
    constructor() {
        this.invoices = [];
        this.maxId = 0;
        this.maxIdPay = 0;
    }
    getCurrencyValueSale() {
        return __awaiter(this, void 0, void 0, function* () {
            var resultWs = '';
            var url = 'https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx?WSDL';
            var args = { Indicador: '318',
                FechaInicio: '28/08/2019',
                FechaFinal: '28/08/2019',
                Nombre: 'Gerald Barquero',
                SubNiveles: 'S',
                CorreoElectronico: 'gerald.bv1@gmail.com',
                Token: 'MURL8ALAGA' };
            yield soap.createClientAsync(url).then((client) => {
                resultWs = client.ObtenerIndicadoresEconomicosXMLAsync(args).then((e) => {
                    var xmlRequest = e[1];
                    const stringRequest = parseString.xml2json(xmlRequest, { compact: true, spaces: 4 });
                    const jsonRequest = JSON.parse(stringRequest);
                    const xmlINDICA = jsonRequest['soap:Envelope']['soap:Body']['ObtenerIndicadoresEconomicosXMLResponse']['ObtenerIndicadoresEconomicosXMLResult']['_text'];
                    const stringINDICA = parseString.xml2json(xmlINDICA, { compact: true, spaces: 4 });
                    const jsonSALE = JSON.parse(stringINDICA);
                    const value = jsonSALE['Datos_de_INGC011_CAT_INDICADORECONOMIC']['INGC011_CAT_INDICADORECONOMIC']['NUM_VALOR']['_text'];
                    return value;
                });
            });
            return resultWs;
        });
    }
    calculatePriceCRC(price) {
        return __awaiter(this, void 0, void 0, function* () {
            let saleValue = 0;
            console.log(price);
            yield this.getCurrencyValueSale().then(result => {
                saleValue = parseFloat(result);
            });
            console.log(saleValue);
            return price * saleValue;
        });
    }
    asyncForEach(array, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let index = 0; index < array.length; index++) {
                yield callback(array[index], index, array);
            }
        });
    }
    createInvoice(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let newInvoice = new invoice_1.Invoice();
            this.maxId++;
            newInvoice.id = this.maxId;
            newInvoice.lines = data.lines;
            newInvoice.client = data.client;
            newInvoice.tax_total = 0;
            newInvoice.discount_total = 0;
            newInvoice.subtotal = 0;
            newInvoice.total = 0;
            newInvoice.balance = 0;
            newInvoice.payments = [];
            yield this.asyncForEach(newInvoice.lines, (e) => __awaiter(this, void 0, void 0, function* () {
                let lastPrice = 0;
                if (e.currency !== 'CRC') {
                    yield this.getCurrencyValueSale().then(result => {
                        e.price_crc = e.price * parseFloat(result);
                    });
                    lastPrice = e.price_crc;
                }
                else {
                    lastPrice = e.price;
                }
                let priceWithDiscount = lastPrice * (e.discount_rate / 100);
                let priceWithTaxt = lastPrice * (e.tax_rate / 100);
                newInvoice.tax_total += priceWithDiscount;
                newInvoice.discount_total += priceWithTaxt;
                newInvoice.subtotal += lastPrice;
                newInvoice.total = newInvoice.subtotal - priceWithDiscount + priceWithTaxt;
            }));
            newInvoice.balance -= newInvoice.total;
            yield this.invoices.push(newInvoice);
            return this.invoices;
        });
    }
    getAllInvoice() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.invoices;
        });
    }
    payInvoice(id, payIn) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.asyncForEach(this.invoices, (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.id == id && e.balance < 0) {
                    let newBalance = e.balance + payIn.amount;
                    if (newBalance < 0) {
                        let pay = new invoice_1.Payments();
                        this.maxIdPay++;
                        pay.id = this.maxIdPay;
                        pay.total = payIn.amount;
                        e.payments.push(pay);
                        e.balance += pay.total;
                        return;
                    }
                }
            }));
            return this.invoices;
        });
    }
    DeleteInvoice(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(id);
            yield this.invoices.forEach((e, i) => {
                console.log(e);
                if (e.id == id) {
                    this.invoices.splice(i, 1);
                }
            });
            return this.invoices;
        });
    }
};
BccrService = __decorate([
    common_1.Injectable()
], BccrService);
exports.BccrService = BccrService;
//# sourceMappingURL=invoice.service.js.map