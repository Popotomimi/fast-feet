"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../models/User");
const Delivery_1 = require("../models/Delivery");
const Recipient_1 = require("../models/Recipient");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5433,
    username: "fastfeet",
    password: "password",
    database: "fastfeet",
    entities: [User_1.User, Delivery_1.Delivery, Recipient_1.Recipient],
    synchronize: true, // apenas para dev
});
