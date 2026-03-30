"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserController {
    // Criar entregador
    static async create(req, res) {
        try {
            const { cpf, password, role } = req.body;
            const currentUser = req.user;
            const userRepo = database_1.AppDataSource.getRepository(User_1.User);
            const existing = await userRepo.findOne({ where: { cpf } });
            if (existing) {
                return res.status(400).json({ error: "CPF já cadastrado" });
            }
            const userRole = (currentUser.role === 'admin' && role) ? role : User_1.UserRole.DELIVERYMAN;
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const user = userRepo.create({
                cpf,
                password: hashedPassword,
                role: userRole,
            });
            await userRepo.save(user);
            return res.status(201).json(user);
        }
        catch (error) {
            return res.status(500).json({ error: "Erro ao criar usuário" });
        }
    }
    // Listar todos entregadores
    static async list(req, res) {
        try {
            const userRepo = database_1.AppDataSource.getRepository(User_1.User);
            const users = await userRepo.find({
                where: { role: User_1.UserRole.DELIVERYMAN },
            });
            return res.json(users);
        }
        catch (error) {
            return res.status(500).json({ error: "Erro ao listar entregadores" });
        }
    }
    // Buscar entregador por ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const userRepo = database_1.AppDataSource.getRepository(User_1.User);
            const user = await userRepo.findOne({
                where: { id: Number(id), role: User_1.UserRole.DELIVERYMAN },
            });
            if (!user) {
                return res.status(404).json({ error: "Entregador não encontrado" });
            }
            return res.json(user);
        }
        catch (error) {
            return res.status(500).json({ error: "Erro ao buscar entregador" });
        }
    }
    // Atualizar entregador
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { cpf } = req.body;
            const userRepo = database_1.AppDataSource.getRepository(User_1.User);
            const user = await userRepo.findOne({
                where: { id: Number(id), role: User_1.UserRole.DELIVERYMAN },
            });
            if (!user) {
                return res.status(404).json({ error: "Entregador não encontrado" });
            }
            user.cpf = cpf ?? user.cpf;
            await userRepo.save(user);
            return res.json(user);
        }
        catch (error) {
            return res.status(500).json({ error: "Erro ao atualizar entregador" });
        }
    }
    // Deletar entregador
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const userRepo = database_1.AppDataSource.getRepository(User_1.User);
            const user = await userRepo.findOne({
                where: { id: Number(id), role: User_1.UserRole.DELIVERYMAN },
            });
            if (!user) {
                return res.status(404).json({ error: "Entregador não encontrado" });
            }
            await userRepo.remove(user);
            return res.json({ message: "Entregador removido com sucesso" });
        }
        catch (error) {
            return res.status(500).json({ error: "Erro ao remover entregador" });
        }
    }
    // Alterar senha
    static async changePassword(req, res) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;
            const currentUser = req.user;
            const userRepo = database_1.AppDataSource.getRepository(User_1.User);
            const user = await userRepo.findOne({ where: { id: Number(id) } });
            if (!user) {
                return res.status(404).json({ error: "Usuário não encontrado" });
            }
            // Só admin pode alterar senha de outro, ou o próprio usuário
            if (currentUser.role !== 'admin' && currentUser.id !== user.id) {
                return res.status(403).json({ error: "Acesso negado" });
            }
            const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
            user.password = hashedPassword;
            await userRepo.save(user);
            return res.json({ message: "Senha alterada com sucesso" });
        }
        catch (error) {
            return res.status(500).json({ error: "Erro ao alterar senha" });
        }
    }
}
exports.UserController = UserController;
