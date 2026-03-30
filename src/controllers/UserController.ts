import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User, UserRole } from "../models/User";
import bcrypt from "bcrypt";

export class UserController {
  // Criar entregador
  static async create(req: Request, res: Response) {
    try {
      const { cpf, password, role } = req.body;
      const currentUser = (req as any).user;
      const userRepo = AppDataSource.getRepository(User);

      const existing = await userRepo.findOne({ where: { cpf } });
      if (existing) {
        return res.status(400).json({ error: "CPF já cadastrado" });
      }

      const userRole =
        currentUser.role === "admin" && role ? role : UserRole.DELIVERYMAN;

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = userRepo.create({
        cpf,
        password: hashedPassword,
        role: userRole,
      });

      await userRepo.save(user);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar usuário" });
    }
  }

  // Listar todos entregadores
  static async list(req: Request, res: Response) {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const users = await userRepo.find({
        where: { role: UserRole.DELIVERYMAN },
      });
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar entregadores" });
    }
  }

  // Buscar entregador por ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: Number(id), role: UserRole.DELIVERYMAN },
      });

      if (!user) {
        return res.status(404).json({ error: "Entregador não encontrado" });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar entregador" });
    }
  }

  // Atualizar entregador
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { cpf } = req.body;

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: Number(id), role: UserRole.DELIVERYMAN },
      });

      if (!user) {
        return res.status(404).json({ error: "Entregador não encontrado" });
      }

      user.cpf = cpf ?? user.cpf;
      await userRepo.save(user);

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar entregador" });
    }
  }

  // Deletar entregador
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: Number(id), role: UserRole.DELIVERYMAN },
      });

      if (!user) {
        return res.status(404).json({ error: "Entregador não encontrado" });
      }

      await userRepo.remove(user);
      return res.json({ message: "Entregador removido com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao remover entregador" });
    }
  }

  // Alterar senha
  static async changePassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      const currentUser = (req as any).user;

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: Number(id) } });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Só admin pode alterar senha de outro, ou o próprio usuário
      if (currentUser.role !== "admin" && currentUser.id !== user.id) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await userRepo.save(user);

      return res.json({ message: "Senha alterada com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao alterar senha" });
    }
  }
}
