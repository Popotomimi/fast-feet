"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryController = void 0;
const database_1 = require("../config/database");
const Delivery_1 = require("../models/Delivery");
const User_1 = require("../models/User");
const NotificationService_1 = require("../services/NotificationService");
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
class DeliveryController {
    static async create(req, res) {
        try {
            const { deliverymanId, recipientId } = req.body;
            const deliveryRepo = database_1.AppDataSource.getRepository(Delivery_1.Delivery);
            const userRepo = database_1.AppDataSource.getRepository(User_1.User);
            const deliveryman = await userRepo.findOne({ where: { id: deliverymanId } });
            if (!deliveryman || deliveryman.role !== 'deliveryman') {
                return res.status(400).json({ error: "Entregador inválido" });
            }
            const delivery = deliveryRepo.create({
                deliveryman,
                recipient: { id: recipientId },
                status: Delivery_1.DeliveryStatus.PENDING,
            });
            await deliveryRepo.save(delivery);
            return res.status(201).json(delivery);
        }
        catch (error) {
            return res.status(500).json({ error: "Erro ao criar encomenda" });
        }
    }
    static async list(req, res) {
        try {
            const deliveryRepo = database_1.AppDataSource.getRepository(Delivery_1.Delivery);
            const user = req.user;
            let deliveries;
            if (user.role === 'admin') {
                deliveries = await deliveryRepo.find({ relations: ['deliveryman', 'recipient'] });
            }
            else {
                deliveries = await deliveryRepo.find({
                    where: { deliveryman: { id: user.id } },
                    relations: ['deliveryman', 'recipient']
                });
            }
            return res.json(deliveries);
        }
        catch (error) {
            return res.status(500).json({ error: "Erro ao listar encomendas" });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const deliveryRepo = database_1.AppDataSource.getRepository(Delivery_1.Delivery);
            const delivery = await deliveryRepo.findOne({
                where: { id: Number(id) },
                relations: ['deliveryman', 'recipient']
            });
            if (!delivery) {
                return res.status(404).json({ error: "Encomenda não encontrada" });
            }
            return res.json(delivery);
        }
        catch (error) {
            return res.status(500).json({ error: "Erro ao buscar encomenda" });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { deliverymanId, recipientId } = req.body;
            const deliveryRepo = database_1.AppDataSource.getRepository(Delivery_1.Delivery);
            const delivery = await deliveryRepo.findOne({ where: { id: Number(id) } });
            if (!delivery) {
                return res.status(404).json({ error: "Encomenda não encontrada" });
            }
            if (deliverymanId) {
                const userRepo = database_1.AppDataSource.getRepository(User_1.User);
                const deliveryman = await userRepo.findOne({ where: { id: deliverymanId } });
                if (deliveryman)
                    delivery.deliveryman = deliveryman;
            }
            if (recipientId) {
                delivery.recipient = { id: recipientId };
            }
            await deliveryRepo.save(delivery);
            return res.json(delivery);
        }
        catch (error) {
            return res.status(500).json({ error: "Erro ao atualizar encomenda" });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deliveryRepo = database_1.AppDataSource.getRepository(Delivery_1.Delivery);
            const delivery = await deliveryRepo.findOne({ where: { id: Number(id) } });
            if (!delivery) {
                return res.status(404).json({ error: "Encomenda não encontrada" });
            }
            await deliveryRepo.remove(delivery);
            return res.json({ message: "Encomenda removida com sucesso" });
        }
        catch (error) {
            return res.status(500).json({ error: "Erro ao remover encomenda" });
        }
    }
    static async updateStatus(req, res) {
        const { id } = req.params;
        const { status, proofPhoto } = req.body;
        const user = req.user;
        const deliveryRepo = database_1.AppDataSource.getRepository(Delivery_1.Delivery);
        const delivery = await deliveryRepo.findOne({
            where: { id: Number(id) },
            relations: ['deliveryman', 'recipient', 'pickedUpBy']
        });
        if (!delivery)
            return res.status(404).json({ error: "Encomenda não encontrada" });
        // Regras de negócio
        if (status === Delivery_1.DeliveryStatus.WAITING && user.role !== 'admin') {
            return res.status(403).json({ error: "Apenas admin pode marcar como aguardando" });
        }
        if (status === Delivery_1.DeliveryStatus.PICKED_UP) {
            delivery.pickedUpBy = { id: user.id };
            delivery.pickedUpAt = new Date();
        }
        if (status === Delivery_1.DeliveryStatus.DELIVERED) {
            if (delivery.pickedUpBy?.id !== user.id) {
                return res.status(403).json({ error: "Apenas o entregador que retirou pode entregar" });
            }
            if (!proofPhoto) {
                return res.status(400).json({ error: "Foto obrigatória para entrega" });
            }
            delivery.deliveredAt = new Date();
        }
        delivery.status = status;
        if (proofPhoto)
            delivery.proofPhoto = proofPhoto;
        await deliveryRepo.save(delivery);
        // Notificar destinatário
        const message = `Status da encomenda ${delivery.id} alterado para ${status}`;
        await NotificationService_1.NotificationService.notifyRecipient(delivery.recipient.id, message);
        return res.json(delivery);
    }
    static async listNearby(req, res) {
        try {
            const { lat, lng } = req.query;
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            if (isNaN(userLat) || isNaN(userLng)) {
                return res.status(400).json({ error: "Latitude e longitude obrigatórias" });
            }
            const deliveryRepo = database_1.AppDataSource.getRepository(Delivery_1.Delivery);
            const deliveries = await deliveryRepo.find({
                where: { status: Delivery_1.DeliveryStatus.WAITING },
                relations: ['recipient']
            });
            const nearby = deliveries.filter(d => {
                const rec = d.recipient;
                if (!rec.latitude || !rec.longitude)
                    return false;
                const distance = haversineDistance(userLat, userLng, rec.latitude, rec.longitude);
                return distance <= 10; // 10km
            });
            return res.json(nearby);
        }
        catch (error) {
            return res.status(500).json({ error: "Erro ao listar encomendas próximas" });
        }
    }
    static async listMyDeliveries(req, res) {
        try {
            const user = req.user;
            const deliveryRepo = database_1.AppDataSource.getRepository(Delivery_1.Delivery);
            const deliveries = await deliveryRepo.find({
                where: { deliveryman: { id: user.id } },
                relations: ['recipient']
            });
            return res.json(deliveries);
        }
        catch (error) {
            return res.status(500).json({ error: "Erro ao listar minhas entregas" });
        }
    }
}
exports.DeliveryController = DeliveryController;
