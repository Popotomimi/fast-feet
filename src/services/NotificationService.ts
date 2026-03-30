export class NotificationService {
  static async notifyRecipient(recipientId: number, message: string) {
    // Por enquanto vamos apenas simular o envio no console

    console.log(
      `📩 Notificação enviada para destinatário ${recipientId}: ${message}`,
    );

    // Retorno simulado
    return {
      recipientId,
      message,
      status: "sent",
      timestamp: new Date(),
    };
  }
}
