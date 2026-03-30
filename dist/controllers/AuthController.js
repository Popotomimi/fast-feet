"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthController {
    static async login(req, res) {
        const { cpf, password } = req.body;
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { cpf } });
        if (!user)
            return res.status(404).json({ error: "Usuário não encontrado" });
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid)
            return res.status(401).json({ error: "Senha inválida" });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, "secret_key", {
            expiresIn: "1d",
        });
        return res.json({ token });
    }
}
exports.AuthController = AuthController;
