"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const invoice_service_1 = require("./invoice.service");
const invoice_1 = require("../entities/invoice");
const invoice_2 = require("../entities/invoice");
let InvoiceController = class InvoiceController {
    constructor(invoiceService) {
        this.invoiceService = invoiceService;
    }
    getValue(id, response) {
        this.invoiceService.getOneInvoice(id).then(token => {
            console.log(token);
            response.status(common_1.HttpStatus.OK).json(token);
        }).catch((e) => {
            response.status(common_1.HttpStatus.OK).json(e);
        });
    }
    createInvoice(newInvoice, response) {
        this.invoiceService.createInvoice(newInvoice).then(result => {
            response.status(common_1.HttpStatus.CREATED).json(result);
        }).catch((e) => {
            response.status(common_1.HttpStatus.OK).json(e);
        });
    }
    payInvoice(id, newPay, response) {
        this.invoiceService.payInvoice(id, newPay).then(result => {
            response.status(common_1.HttpStatus.CREATED).json(result);
        }).catch((e) => {
            response.status(common_1.HttpStatus.OK).json(e);
        });
    }
    getAll(response) {
        this.invoiceService.getAllInvoice().then(list => {
            response.status(common_1.HttpStatus.OK).json(list);
        }).catch((e) => {
            response.status(common_1.HttpStatus.OK).json(e);
        });
    }
    deleteInvoice(id, response) {
        this.invoiceService.DeleteInvoice(id).then(result => {
            response.status(common_1.HttpStatus.CREATED).json(result);
        }).catch((e) => {
            response.status(common_1.HttpStatus.OK).json(e);
        });
    }
};
__decorate([
    common_1.Get(':id'),
    __param(0, common_1.Param('id')), __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "getValue", null);
__decorate([
    common_1.Post(),
    __param(0, common_1.Body()), __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invoice_1.Invoice, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "createInvoice", null);
__decorate([
    common_1.Post(':id'),
    __param(0, common_1.Param('id')), __param(1, common_1.Body()), __param(2, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, invoice_2.PayInvoice, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "payInvoice", null);
__decorate([
    common_1.Get(),
    __param(0, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "getAll", null);
__decorate([
    common_1.Delete(':id'),
    __param(0, common_1.Param('id')), __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "deleteInvoice", null);
InvoiceController = __decorate([
    common_1.Controller('invoice'),
    __metadata("design:paramtypes", [invoice_service_1.InvoiceService])
], InvoiceController);
exports.InvoiceController = InvoiceController;
//# sourceMappingURL=invoice.controller.js.map