import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Delivery, DeliveryStatus } from "../models/Delivery";
import { User } from "../models/User";
import { NotificationService } from "../services/NotificationService";

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class DeliveryController {
  static async create(req: Request, res: Response) {
    try {
      const { deliverymanId, recipientId } = req.body;
      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const userRepo = AppDataSource.getRepository(User);

      const deliveryman = await userRepo.findOne({
        where: { id: deliverymanId },
      });
      if (!deliveryman || deliveryman.role !== "deliveryman") {
        return res.status(400).json({ error: "Entregador inválido" });
      }

      const delivery = deliveryRepo.create({
        deliveryman,
        recipient: { id: recipientId },
        status: DeliveryStatus.PENDING,
      });

      await deliveryRepo.save(delivery);
      return res.status(201).json(delivery);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar encomenda" });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const user = (req as any).user;

      let deliveries;
      if (user.role === "admin") {
        deliveries = await deliveryRepo.find({
          relations: ["deliveryman", "recipient"],
        });
      } else {
        deliveries = await deliveryRepo.find({
          where: { deliveryman: { id: user.id } },
          relations: ["deliveryman", "recipient"],
        });
      }

      return res.json(deliveries);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar encomendas" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const delivery = await deliveryRepo.findOne({
        where: { id: Number(id) },
        relations: ["deliveryman", "recipient"],
      });

      if (!delivery) {
        return res.status(404).json({ error: "Encomenda não encontrada" });
      }

      return res.json(delivery);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar encomenda" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { deliverymanId, recipientId } = req.body;

      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const delivery = await deliveryRepo.findOne({
        where: { id: Number(id) },
      });

      if (!delivery) {
        return res.status(404).json({ error: "Encomenda não encontrada" });
      }

      if (deliverymanId) {
        const userRepo = AppDataSource.getRepository(User);
        const deliveryman = await userRepo.findOne({
          where: { id: deliverymanId },
        });
        if (deliveryman) delivery.deliveryman = deliveryman;
      }

      if (recipientId) {
        delivery.recipient = { id: recipientId } as any;
      }

      await deliveryRepo.save(delivery);
      return res.json(delivery);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar encomenda" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const delivery = await deliveryRepo.findOne({
        where: { id: Number(id) },
      });

      if (!delivery) {
        return res.status(404).json({ error: "Encomenda não encontrada" });
      }

      await deliveryRepo.remove(delivery);
      return res.json({ message: "Encomenda removida com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao remover encomenda" });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status, proofPhoto } = req.body;
    const user = (req as any).user;

    const deliveryRepo = AppDataSource.getRepository(Delivery);
    const delivery = await deliveryRepo.findOne({
      where: { id: Number(id) },
      relations: ["deliveryman", "recipient", "pickedUpBy"],
    });

    if (!delivery)
      return res.status(404).json({ error: "Encomenda não encontrada" });

    // Regras de negócio
    if (status === DeliveryStatus.WAITING && user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Apenas admin pode marcar como aguardando" });
    }

    if (status === DeliveryStatus.PICKED_UP) {
      delivery.pickedUpBy = { id: user.id } as any;
      delivery.pickedUpAt = new Date();
    }

    if (status === DeliveryStatus.DELIVERED) {
      if (delivery.pickedUpBy?.id !== user.id) {
        return res
          .status(403)
          .json({ error: "Apenas o entregador que retirou pode entregar" });
      }
      if (!proofPhoto) {
        return res.status(400).json({ error: "Foto obrigatória para entrega" });
      }
      delivery.deliveredAt = new Date();
    }

    delivery.status = status;
    if (proofPhoto) delivery.proofPhoto = proofPhoto;

    await deliveryRepo.save(delivery);

    // Notificar destinatário
    const message = `Status da encomenda ${delivery.id} alterado para ${status}`;
    await NotificationService.notifyRecipient(delivery.recipient.id, message);

    return res.json(delivery);
  }

  static async listNearby(req: Request, res: Response) {
    try {
      const { lat, lng } = req.query;
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);

      if (isNaN(userLat) || isNaN(userLng)) {
        return res
          .status(400)
          .json({ error: "Latitude e longitude obrigatórias" });
      }

      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const deliveries = await deliveryRepo.find({
        where: { status: DeliveryStatus.WAITING },
        relations: ["recipient"],
      });

      const nearby = deliveries.filter((d) => {
        const rec = d.recipient;
        if (!rec.latitude || !rec.longitude) return false;
        const distance = haversineDistance(
          userLat,
          userLng,
          rec.latitude,
          rec.longitude,
        );
        return distance <= 10; // 10km
      });

      return res.json(nearby);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao listar encomendas próximas" });
    }
  }

  static async listMyDeliveries(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const deliveries = await deliveryRepo.find({
        where: { deliveryman: { id: user.id } },
        relations: ["recipient"],
      });

      return res.json(deliveries);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar minhas entregas" });
    }
  }
}
