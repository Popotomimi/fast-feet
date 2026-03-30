import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Recipient } from "../models/Recipient";

export class RecipientController {
  // Criar destinatário
  static async create(req: Request, res: Response) {
    try {
      const { name, address, city, state, zipcode } = req.body;
      const recipientRepo = AppDataSource.getRepository(Recipient);

      const recipient = recipientRepo.create({
        name,
        address,
        city,
        state,
        zipcode,
      });
      await recipientRepo.save(recipient);

      return res.status(201).json(recipient);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar destinatário" });
    }
  }

  // Listar todos destinatários
  static async list(req: Request, res: Response) {
    try {
      const recipientRepo = AppDataSource.getRepository(Recipient);
      const recipients = await recipientRepo.find();
      return res.json(recipients);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar destinatários" });
    }
  }

  // Buscar destinatário por ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const recipientRepo = AppDataSource.getRepository(Recipient);
      const recipient = await recipientRepo.findOne({
        where: { id: Number(id) },
      });

      if (!recipient) {
        return res.status(404).json({ error: "Destinatário não encontrado" });
      }

      return res.json(recipient);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar destinatário" });
    }
  }

  // Atualizar destinatário
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, address, city, state, zipcode } = req.body;

      const recipientRepo = AppDataSource.getRepository(Recipient);
      const recipient = await recipientRepo.findOne({
        where: { id: Number(id) },
      });

      if (!recipient) {
        return res.status(404).json({ error: "Destinatário não encontrado" });
      }

      recipient.name = name ?? recipient.name;
      recipient.address = address ?? recipient.address;
      recipient.city = city ?? recipient.city;
      recipient.state = state ?? recipient.state;
      recipient.zipcode = zipcode ?? recipient.zipcode;

      await recipientRepo.save(recipient);

      return res.json(recipient);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar destinatário" });
    }
  }

  // Deletar destinatário
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const recipientRepo = AppDataSource.getRepository(Recipient);
      const recipient = await recipientRepo.findOne({
        where: { id: Number(id) },
      });

      if (!recipient) {
        return res.status(404).json({ error: "Destinatário não encontrado" });
      }

      await recipientRepo.remove(recipient);
      return res.json({ message: "Destinatário removido com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao remover destinatário" });
    }
  }
}
