package com.lumyra.store.controller;

import com.lumyra.store.model.OrderRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Permite chamadas do frontend
public class EmailController {

    @Autowired
    private JavaMailSender mailSender;

    @PostMapping("/send-email")
    public String sendOrderEmail(@RequestBody OrderRequest order) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("contato@lumyra.com");
            message.setTo(order.getCustomerEmail());
            message.setSubject("Pedido Confirmado - Lumyra #" + order.getOrderId());
            
            String content = String.format(
                "Olá %s,\n\n" +
                "Seu pedido #%s foi recebido com sucesso!\n\n" +
                "Detalhes do Pedido:\n" +
                "- Valor Total: %s\n" +
                "- Método de Pagamento: %s\n\n" +
                "Estamos preparando suas peças com todo cuidado.\n" +
                "Obrigado por escolher a Lumyra.\n\n" +
                "Atenciosamente,\n" +
                "Equipe Lumyra",
                order.getCustomerName(), order.getOrderId(), order.getTotal(), order.getPaymentMethod()
            );
            
            message.setText(content);
            mailSender.send(message);
            
            return "Email enviado com sucesso!";
        } catch (Exception e) {
            return "Erro ao enviar e-mail: " + e.getMessage();
        }
    }
}
