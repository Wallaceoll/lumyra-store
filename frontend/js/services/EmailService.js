
class EmailService {

  static API_URL = 'http://localhost:8080/api/send-email';

  /**
   * Envia e-mail de confirmação de pedido.
   * 
   * @param {Object} order — { orderId, customerName, customerEmail, total, paymentMethod }
   */
  static async sendOrderConfirmation(order) {
    console.info('[EmailService] Iniciando disparo para:', order.customerEmail);

    try {
      const response = await fetch(EmailService.API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(order)
      });

      if (!response.ok) {
        throw new Error(`Backend retornou status ${response.status}`);
      }

      const result = await response.text();
      console.log('[EmailService] Sucesso:', result);
      return { success: true, message: result };

    } catch (err) {
      console.error('[EmailService] Falha ao enviar e-mail:', err);
      // Fallback
      return { success: false, error: err.message };
    }
  }
}

// Disponibiliza globalmente
window.EmailService = EmailService;
