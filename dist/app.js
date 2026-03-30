"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const database_1 = require("./config/database");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(routes_1.default);
database_1.AppDataSource.initialize()
    .then(() => console.log("Banco conectado"))
    .catch((err) => console.error(err));
exports.default = app;
