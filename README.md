# Lumyra Store — Documentação de Arquitetura

## Estrutura de Diretórios

```
lumyra-store/
├── index.html                  # Tela 1 — Home
├── pages/
│   ├── colecoes.html           # Tela 2 — Listagem com filtros
│   ├── produto.html            # Tela 3 — Detalhe do produto
│   ├── checkout.html           # Tela 4 — Pagamento (3 steps)
│   └── sucesso.html            # Tela 5 — Confirmação do pedido
├── assets/
│   ├── img/                    # Imagens locais (joias, relógios)
│   └── css/
│       └── lumyra.css          # Design system global (tokens, componentes)
└── js/
    ├── components/
    │   └── Header.js           # Header universal + cart drawer (injetado em todas as telas)
    ├── services/
    │   ├── CartService.js      # Gerencia carrinho com localStorage + Observer pattern
    │   ├── ProductService.js   # Catálogo de produtos (mock → troca por fetch real)
    │   └── StripeService.js    # Integração de pagamento (simulado → troca por backend)
    └── main.js                 # Inicialização global + Router + Toast
```

---

## Fluxo de Carregamento (Ordem de Scripts)

Toda página carrega os scripts nesta sequência no final do `<body>`:

```html
<script src="/js/services/CartService.js"></script>
<script src="/js/services/ProductService.js"></script>
<script src="/js/services/StripeService.js"></script>
<script src="/js/components/Header.js"></script>  <!-- depende dos services -->
<script src="/js/main.js"></script>               <!-- depende de tudo acima -->
```

Em subpáginas (`/pages/*`) os caminhos usam `../`:
```html
<script src="../js/services/CartService.js"></script>
```

---

## Services — Guia de Integração com Spring Boot

### CartService.js

Estado do carrinho em memória + localStorage. Para migrar para backend:

```javascript
// Hoje (localStorage)
static _persist() {
  localStorage.setItem('lumyra_cart', JSON.stringify(this.#items));
}

// Com Spring Boot — substitua por:
static async syncWithBackend() {
  await fetch('/api/cart', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(this.toPayload())
  });
}
```

Endpoint Spring Boot sugerido:
```
GET    /api/cart          → retorna carrinho da sessão
PUT    /api/cart          → sincroniza carrinho
DELETE /api/cart/{itemId} → remove item
```

---

### ProductService.js

Hoje retorna dados em memória. Para conectar ao backend:

```javascript
// Substitua _getMockData() por:
static async fetchAll() {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Erro ao buscar produtos');
  return res.json();
}

static async fetchById(id) {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error(`Produto ${id} não encontrado`);
  return res.json();
}
```

Endpoint Spring Boot sugerido:
```
GET /api/products              → lista todos
GET /api/products/{id}         → detalhe
GET /api/products?cat=aliancas → filtro por categoria
GET /api/products/featured     → destaques (home)
```

---

### StripeService.js

Fluxo completo de produção:

**1. Frontend** — `StripeService.processPayment()` chama:
```javascript
POST /api/payments/create-intent
Body: { amount: 450000, currency: 'brl', customerEmail: 'user@email.com' }
```

**2. Backend Spring Boot** (`PaymentController.java`):
```java
@PostMapping("/api/payments/create-intent")
public ResponseEntity<Map<String, String>> createIntent(@RequestBody PaymentRequest req) {
    Stripe.apiKey = System.getenv("STRIPE_SECRET_KEY");

    PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
        .setAmount(req.getAmount())
        .setCurrency(req.getCurrency())
        .setReceiptEmail(req.getCustomerEmail())
        .build();

    PaymentIntent intent = PaymentIntent.create(params);
    return ResponseEntity.ok(Map.of("clientSecret", intent.getClientSecret()));
}
```

**3. Frontend** — confirma com Stripe.js:
```javascript
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement }
});
```

**4. Webhook** — Stripe notifica Spring Boot:
```
POST /api/payments/webhook
```

Para ativar o fluxo real, edite `StripeService.js`:
- Substitua `PUBLISHABLE_KEY` pela sua chave `pk_live_...`
- Delete a linha `return 'SIMULATED';` em `_createPaymentIntent()`
- Descomente o bloco `fetch` abaixo

---

## Header.js — Componente Universal

Injetado automaticamente em todas as páginas via `Header.init()`. Resolve paths relativos com base no `window.location.pathname`:

```javascript
// Detecta se está em subpágina (/pages/*)
const isSubpage = window.location.pathname.includes('/pages/');
const base = isSubpage ? '../' : '';
```

Para adicionar novas abas de navegação, edite o objeto `Header.ROUTES`:

```javascript
static ROUTES = {
  'Nova Aba': '/pages/nova-pagina.html',
  // ...
};
```

---

## Design System — Tokens CSS

Todos os tokens ficam em `assets/css/lumyra.css`. Para trocar o tema inteiro, edite apenas `:root`:

```css
:root {
  --cream:      #F9F6F0;   /* fundo principal */
  --bone:       #EDE8DE;   /* bordas e superfícies secundárias */
  --ink:        #0E0D0B;   /* texto e botões primários */
  --gold:       #B8963E;   /* cor de destaque / marca */
  --gold-light: #D4AF70;   /* gold em fundos escuros */
  --warm-gray:  #8A8278;   /* textos secundários */
  --charcoal:   #2A2622;   /* preços e textos médios */
}
```

---

## Navegação entre Páginas

O carrinho persiste entre páginas via `localStorage` (chave `lumyra_cart`). A sessão do pedido é passada via `sessionStorage`:

```javascript
// checkout.html → salva após pagamento aprovado
sessionStorage.setItem('lumyra_order_id', result.orderId);
sessionStorage.setItem('lumyra_order_email', email);

// sucesso.html → lê e exibe
const orderId = sessionStorage.getItem('lumyra_order_id');
```

---

## Funcionalidades por Página

| Página | Funcionalidade Principal |
|--------|--------------------------|
| `index.html` | Hero + grid editorial assimétrico de produtos em destaque |
| `colecoes.html` | Listagem completa com filtro por categoria + ordenação |
| `produto.html` | Galeria, seletor de tamanho, produtos relacionados |
| `checkout.html` | 3 steps (Dados → Entrega → Pagamento) + ViaCEP auto-fill |
| `sucesso.html` | Confirmação animada + confetti + timeline de status |

---

## Requisitos de Produção

1. **Servidor HTTP** — Não abra os arquivos diretamente como `file://`. Use:
   ```bash
   # Python (mais simples)
   python3 -m http.server 3000

   # Node.js
   npx serve .

   # VS Code
   Extensão Live Server
   ```

2. **Stripe** — Troque a chave pública em `StripeService.PUBLISHABLE_KEY`

3. **Backend** — Implemente os endpoints documentados acima em Spring Boot

4. **Imagens** — Coloque imagens reais em `/assets/img/` e atualize `ProductService._getMockData()`
