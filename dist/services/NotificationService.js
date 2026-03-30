"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
class NotificationService {
    static async notifyRecipient(recipientId, message) {
        // Por enquanto vamos apenas simular o envio no console
        console.log(`📩 Notificação enviada para destinatário ${recipientId}: ${message}`);
        // Retorno simulado
        return {
            recipientId,
            message,
            status: "sent",
            timestamp: new Date(),
        };
    }
}
exports.NotificationService = NotificationService;
