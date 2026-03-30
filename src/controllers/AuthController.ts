import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthController {
  static async login(req: Request, res: Response) {
    const { cpf, password } = req.body;
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { cpf } });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Senha inválida" });

    const token = jwt.sign({ id: user.id, role: user.role }, "secret_key", {
      expiresIn: "1d",
    });
    return res.json({ token });
  }

  static async register(req: Request, res: Response) {
    try {
      const { cpf, password, role } = req.body;
      const userRepo = AppDataSource.getRepository(User);

      const existing = await userRepo.findOne({ where: { cpf } });
      if (existing) {
        return res.status(400).json({ error: "CPF já cadastrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = userRepo.create({
        cpf,
        password: hashedPassword,
        role: role || "deliveryman",
      });

      await userRepo.save(user);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao registrar usuário" });
    }
  }
}
