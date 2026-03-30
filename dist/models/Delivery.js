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
exports.Delivery = exports.DeliveryStatus = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Recipient_1 = require("./Recipient");
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["PENDING"] = "pending";
    DeliveryStatus["WAITING"] = "waiting";
    DeliveryStatus["PICKED_UP"] = "picked_up";
    DeliveryStatus["DELIVERED"] = "delivered";
    DeliveryStatus["RETURNED"] = "returned";
})(DeliveryStatus || (exports.DeliveryStatus = DeliveryStatus = {}));
let Delivery = class Delivery {
};
exports.Delivery = Delivery;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Delivery.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    __metadata("design:type", User_1.User)
], Delivery.prototype, "deliveryman", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Recipient_1.Recipient),
    __metadata("design:type", Recipient_1.Recipient)
], Delivery.prototype, "recipient", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: DeliveryStatus,
        default: DeliveryStatus.PENDING,
    }),
    __metadata("design:type", String)
], Delivery.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Delivery.prototype, "proofPhoto", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Delivery.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Delivery.prototype, "pickedUpAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Delivery.prototype, "deliveredAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    __metadata("design:type", Object)
], Delivery.prototype, "pickedUpBy", void 0);
exports.Delivery = Delivery = __decorate([
    (0, typeorm_1.Entity)()
], Delivery);
