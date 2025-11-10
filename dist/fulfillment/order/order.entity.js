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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelOrderDto = exports.AddException = exports.ValidateOrderDto = exports.MarkUnusualOrderDto = exports.ApproveOrderDto = exports.ConfirmPickUpOrderDto = exports.AcceptDropOffDto = exports.UpdateOrderDto = exports.CreateOrderDto = exports.AddressDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const mapped_types_1 = require("@nestjs/mapped-types");
const lodash_1 = require("lodash");
const sanitize = (v) => typeof v === 'string' ? (0, lodash_1.escape)(v.trim().replace(/\s+/g, ' ')) : v;
class AddressDto {
}
exports.AddressDto = AddressDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Label must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], AddressDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Address line must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], AddressDto.prototype, "addressLine", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'City must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], AddressDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'State must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], AddressDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Country must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], AddressDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Postal code must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], AddressDto.prototype, "postalCode", void 0);
__decorate([
    (0, class_validator_1.IsLatitude)({ message: 'Latitude must be a valid number' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Latitude is required' }),
    __metadata("design:type", String)
], AddressDto.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsLongitude)({ message: 'Longitude must be a valid number' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Longitude is required' }),
    __metadata("design:type", String)
], AddressDto.prototype, "long", void 0);
class CreateOrderDto {
    constructor() {
        this.quantity = 1;
    }
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Customer name must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value.toLowerCase())),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Phone number must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Customer ID must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Receiver name must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "receiverName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Receiver email must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value.toLowerCase())),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "receiverEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Receiver phone must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "receiverPhone", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Receiver ID must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "receiverId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Branch ID must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "branchId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Driver ID must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "driverId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ServiceType, { message: 'Invalid service type provided' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "serviceType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.FulfillmentType, { message: 'Invalid fulfillment type provided' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "fulfillmentType", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Tracking code must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "trackingCode", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Weight must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'Weight must be greater than zero' }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => value.map((v) => v.trim())),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'isFragile must be a boolean' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateOrderDto.prototype, "isFragile", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ShipmentType, { message: 'Invalid shipment type' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "shipmentType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ShippingScope, { message: 'Invalid shipping scope' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "shippingScope", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Length must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'Length must be positive' }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "length", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Width must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'Width must be positive' }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "width", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Quantity must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'Quantity must be positive' }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "quantity", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Height must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'Height must be positive' }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "height", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.fulfillmentType === client_1.FulfillmentType.PICKUP),
    (0, class_validator_1.IsDateString)({}, { message: 'Pickup date must be a valid ISO date' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "pickupDate", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.fulfillmentType === client_1.FulfillmentType.PICKUP),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ message: 'Pickup address must be a valid object' }),
    (0, class_transformer_1.Type)(() => AddressDto),
    __metadata("design:type", AddressDto)
], CreateOrderDto.prototype, "pickupAddress", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)({ message: 'Delivery address must be a valid object' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Delivery address is required' }),
    (0, class_transformer_1.Type)(() => AddressDto),
    __metadata("design:type", AddressDto)
], CreateOrderDto.prototype, "deliveryAddress", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Delivery date must be a valid ISO date' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "deliveryDate", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Cost must be a number' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "cost", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Payment ID must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "paymentId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'isUnusual must be a boolean' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateOrderDto.prototype, "isUnusual", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Unusual reason must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "unusualReason", void 0);
class UpdateOrderDto extends (0, mapped_types_1.PartialType)(CreateOrderDto) {
}
exports.UpdateOrderDto = UpdateOrderDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.OrderStatus, { message: 'Invalid order status' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "status", void 0);
class AcceptDropOffDto {
}
exports.AcceptDropOffDto = AcceptDropOffDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Tracking code must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tracking code is required' }),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], AcceptDropOffDto.prototype, "trackingCode", void 0);
class ConfirmPickUpOrderDto {
}
exports.ConfirmPickUpOrderDto = ConfirmPickUpOrderDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Order Id must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Order Id field is required' }),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], ConfirmPickUpOrderDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Driver Id must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Driver Id field is required' }),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], ConfirmPickUpOrderDto.prototype, "driverId", void 0);
class ApproveOrderDto {
}
exports.ApproveOrderDto = ApproveOrderDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Order Id must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Order Id field is required' }),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], ApproveOrderDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Reason must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Reason is required' }),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], ApproveOrderDto.prototype, "reason", void 0);
class MarkUnusualOrderDto {
}
exports.MarkUnusualOrderDto = MarkUnusualOrderDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Is Fragile field is required' }),
    (0, class_validator_1.IsBoolean)({ message: 'Is Fragile Field must be a boolean' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MarkUnusualOrderDto.prototype, "isFragile", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Unusual Reason must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Unusual Reason is required' }),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], MarkUnusualOrderDto.prototype, "unusualReason", void 0);
class ValidateOrderDto extends (0, mapped_types_1.PartialType)(CreateOrderDto) {
}
exports.ValidateOrderDto = ValidateOrderDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Validated by must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], ValidateOrderDto.prototype, "validatedBy", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Validated notes must be a string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], ValidateOrderDto.prototype, "validatedNotes", void 0);
class AddException {
}
exports.AddException = AddException;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Order ID must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Order ID is required' }),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], AddException.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Reason must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Reason is required' }),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], AddException.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Type must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Exception type is required' }),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], AddException.prototype, "type", void 0);
class CancelOrderDto {
}
exports.CancelOrderDto = CancelOrderDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Order ID must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Order ID is required' }),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], CancelOrderDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Reason must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Cancel reason is required' }),
    (0, class_transformer_1.Transform)(({ value }) => sanitize(value)),
    __metadata("design:type", String)
], CancelOrderDto.prototype, "reason", void 0);
//# sourceMappingURL=order.entity.js.map