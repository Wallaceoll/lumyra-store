/**
 * StripeService.js — Integração de Pagamento
 * ─────────────────────────────────────────────────────────────
 * Responsabilidade única: orquestrar o fluxo de pagamento com Stripe.
 *
 * Fluxo de produção com Spring Boot:
 *  1. Frontend chama StripeService.createPaymentIntent(total)
 *  2. StripeService faz POST /api/payments/create-intent no Spring Boot
 *  3. Spring Boot cria o PaymentIntent na API Stripe e retorna { clientSecret }
 *  4. StripeService confirma o pagamento no frontend via stripe.confirmCardPayment()
 *  5. Stripe notifica o backend via webhook para registrar o pedido
 *
 * Hoje: fluxo simulado. Para ir a produção:
 *   - Substitua PUBLISHABLE_KEY pela chave real (pk_live_...)
 *   - Implemente o endpoint POST /api/payments/create-intent no Spring Boot
 *   - Descomente o bloco "PRODUÇÃO" abaixo
 * ─────────────────────────────────────────────────────────────
 */

class StripeService {

  // ⚠️  Substitua pela sua chave pública real (pk_live_... ou pk_test_...)
  static PUBLISHABLE_KEY = 'pk_test_SUA_CHAVE_AQUI';

  // URL do seu backend Spring Boot
  static API_BASE = 'http://localhost:8080/api';

  // Instância interna do Stripe (inicializada em init())
  static #stripe       = null;
  static #cardElement  = null;
  static #initialized  = false;

  /* ── INICIALIZAÇÃO ────────────────────────────────────────── */

  /**
   * Monta o campo de cartão do Stripe num elemento DOM.
   * Chame uma vez ao abrir o modal de checkout.
   *
   * @param {string} mountSelector — seletor CSS do container (ex: '#card-element')
   */
  static init(mountSelector = '#card-element') {
    if (StripeService.#initialized) return;

    try {
      // Carrega Stripe.js (já deve estar no <head> via <script>)
      StripeService.#stripe = Stripe(StripeService.PUBLISHABLE_KEY);

      const elements = StripeService.#stripe.elements({
        fonts: [{
          cssSrc: 'https://fonts.googleapis.com/css2?family=Syne:wght@400&display=swap'
        }]
      });

      StripeService.#cardElement = elements.create('card', {
        style: {
          base: {
            fontFamily:  'Syne, sans-serif',
            fontSize:    '14px',
            color:       '#0E0D0B',
            letterSpacing: '0.02em',
            '::placeholder': { color: '#8A8278' },
            iconColor:   '#B8963E',
          },
          invalid: { color: '#c94f4f', iconColor: '#c94f4f' }
        },
        hidePostalCode: true
      });

      StripeService.#cardElement.mount(mountSelector);

      // Propaga erros de validação para o DOM
      StripeService.#cardElement.on('change', ({ error }) => {
        const errEl = document.getElementById('cardError');
        if (errEl) {
          errEl.textContent = error ? error.message : '';
          errEl.classList.toggle('visible', !!error);
        }
      });

      StripeService.#initialized = true;

    } catch (err) {
      console.warn('[StripeService] Stripe.js não disponível, usando fallback de campos:', err.message);
      StripeService._mountFallbackFields(mountSelector);
    }
  }

  /* ── FLUXO DE PAGAMENTO ───────────────────────────────────── */

  /**
   * Processa o pagamento completo.
   *
   * @param {{ total, customer, shipping }} payload
   *   total    — valor em reais (ex: 4500)
   *   customer — { name, email, phone }
   *   shipping — { address, number, city, state, cep }
   *
   * @returns {Promise<{ success: boolean, orderId?: string, error?: string }>}
   */
  static async processPayment({ total, customer, shipping }) {
    try {
      const clientSecret = await StripeService._createPaymentIntent(total, customer);

      /* ── MODO SIMULADO (sem backend real) ─────────────────── */
      if (clientSecret === 'SIMULATED') {
        await StripeService._simulateDelay(2000);
        const orderId = `LMR-${Date.now()}`;
        StripeService._saveOrderLocally({ orderId, total, customer, shipping, items: CartService.toPayload().items });
        return { success: true, orderId };
      }

      /* ── PRODUÇÃO: confirma no Stripe ─────────────────────── */
      const { error, paymentIntent } = await StripeService.#stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: StripeService.#cardElement,
            billing_details: {
              name:  `${customer.firstName} ${customer.lastName}`,
              email: customer.email,
              phone: customer.phone,
            },
          },
        }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      if (paymentIntent.status === 'succeeded') {
        return { success: true, orderId: paymentIntent.id };
      }

      return { success: false, error: 'Pagamento não confirmado. Tente novamente.' };

    } catch (err) {
      console.error('[StripeService] Erro no processamento:', err);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  }

  /* ── CRIAÇÃO DO PAYMENT INTENT ────────────────────────────── */

  /**
   * Solicita o clientSecret ao backend.
   *
   * Em PRODUÇÃO: descomente o fetch abaixo e delete o return 'SIMULATED'.
   *
   * Endpoint Spring Boot esperado:
   *   POST /api/payments/create-intent
   *   Body:  { amount: number, currency: 'brl', customerEmail: string }
   *   Return: { clientSecret: string }
   */
  static async _createPaymentIntent(totalBRL, customer) {

    // ── SIMULADO — delete esta linha ao integrar o backend ────
    return 'SIMULATED';

    /* ── PRODUÇÃO ──────────────────────────────────────────────
    const amountCents = Math.round(totalBRL * 100); // Stripe usa centavos

    const res = await fetch(`${StripeService.API_BASE}/payments/create-intent`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        amount:        amountCents,
        currency:      'brl',
        customerEmail: customer.email,
        customerName:  `${customer.firstName} ${customer.lastName}`,
      }),
    });

    if (!res.ok) throw new Error(`Backend retornou ${res.status}`);

    const { clientSecret } = await res.json();
    return clientSecret;
    ── ─────────────────────────────────────────────────────── */
  }

  /* ── HELPERS PRIVADOS ─────────────────────────────────────── */

  /** Salva pedido no localStorage (apenas em modo simulado) */
  static _saveOrderLocally(order) {
    const orders = JSON.parse(localStorage.getItem('lumyra_orders') || '[]');
    orders.unshift({ ...order, date: new Date().toISOString() });
    localStorage.setItem('lumyra_orders', JSON.stringify(orders));
  }

  /** Campos de cartão fallback (quando Stripe.js não carrega) */
  static _mountFallbackFields(selector) {
    const container = document.querySelector(selector);
    if (!container) return;
    container.innerHTML = `
      <input type="text" placeholder="Número do cartão (4242 4242 4242 4242)"
        style="width:100%;background:var(--cream);border:1px solid var(--bone);
               padding:12px 16px;font-family:Syne,sans-serif;font-size:14px;
               color:var(--ink);outline:none;margin-bottom:8px;">
      <div style="display:flex;gap:8px">
        <input type="text" placeholder="MM / AA"
          style="flex:1;background:var(--cream);border:1px solid var(--bone);
                 padding:12px 16px;font-family:Syne,sans-serif;font-size:14px;
                 color:var(--ink);outline:none;">
        <input type="text" placeholder="CVC"
          style="flex:1;background:var(--cream);border:1px solid var(--bone);
                 padding:12px 16px;font-family:Syne,sans-serif;font-size:14px;
                 color:var(--ink);outline:none;">
      </div>`;
    StripeService.#initialized = true;
  }

  static _simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Reseta para permitir nova montagem (útil em SPA) */
  static reset() {
    if (StripeService.#cardElement) {
      StripeService.#cardElement.unmount();
      StripeService.#cardElement = null;
    }
    StripeService.#initialized = false;
  }
}
