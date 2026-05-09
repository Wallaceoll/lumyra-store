
class CartService {

  // Chave do localStorage — altere se precisar isolar por sessão
  static #STORAGE_KEY = 'lumyra_cart';

  // Lista interna de observers (callbacks)
  static #listeners = [];

  // Cache em memória dos itens
  static #items = CartService._loadFromStorage();

  
  /** Retorna cópia imutável dos itens */
  static getItems() {
    return [...CartService.#items];
  }

  /** Total de unidades no carrinho */
  static getCount() {
    return CartService.#items.reduce((acc, item) => acc + item.qty, 0);
  }

  /** Valor total em reais */
  static getTotal() {
    return CartService.#items.reduce((acc, item) => acc + item.price * item.qty, 0);
  }

  /** Verifica se um produto já está no carrinho */
  static has(productId) {
    return CartService.#items.some(i => i.id === productId);
  }

  /** Retorna um item pelo ID ou null */
  static findById(productId) {
    return CartService.#items.find(i => i.id === productId) ?? null;
  }

  
  /**
   * Adiciona um produto ao carrinho.
   * Se já existir, incrementa a quantidade.
   *
   * @param {{ id, name, price, cat, img }} product
   * @param {number} qty - Quantidade a adicionar (default: 1)
   */
  static add(product, qty = 1) {
    if (!product?.id) throw new Error('[CartService] Produto inválido: id ausente.');

    const existing = CartService.#items.find(i => i.id === product.id);

    if (existing) {
      existing.qty += qty;
    } else {
      CartService.#items.push({ ...product, qty });
    }

    CartService._commit();
    return CartService.getItems();
  }

  /**
   * Remove completamente um produto do carrinho.
   * @param {string} productId
   */
  static remove(productId) {
    CartService.#items = CartService.#items.filter(i => i.id !== productId);
    CartService._commit();
  }

  /**
   * Ajusta a quantidade de um item em +/- delta.
   * Remove o item se a quantidade chegar a 0.
   *
   * @param {string} productId
   * @param {number} delta — positivo para aumentar, negativo para diminuir
   */
  static updateQty(productId, delta) {
    const item = CartService.#items.find(i => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) CartService.remove(productId);
    else CartService._commit();
  }

  /** Esvazia o carrinho por completo */
  static clear() {
    CartService.#items = [];
    CartService._commit();
  }

  
  /**
   * Registra um callback chamado sempre que o carrinho mudar.
   * O callback recebe o total de itens (count) como argumento.
   *
   * @param {(count: number) => void} callback
   */
  static onChange(callback) {
    CartService.#listeners.push(callback);
  }

  /** Remove um listener previamente registrado */
  static offChange(callback) {
    CartService.#listeners = CartService.#listeners.filter(l => l !== callback);
  }

  
  /**
   * Formata um valor numérico como moeda brasileira.
   * @param {number} value
   * @returns {string} Ex: "R$ 4.500"
   */
  static formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', currency: 'BRL', minimumFractionDigits: 0
    }).format(value);
  }

  /**
   * Serializa o carrinho para envio ao backend.
   * Retorna um objeto pronto para JSON.stringify().
   */
  static toPayload() {
    return {
      items: CartService.#items.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
      total: CartService.getTotal(),
      count: CartService.getCount(),
    };
  }

  
  /** Persiste e notifica todos os observers */
  static _commit() {
    CartService._persist();
    const count = CartService.getCount();
    CartService.#listeners.forEach(fn => fn(count));
  }

  /** Salva no localStorage */
  static _persist() {
    try {
      localStorage.setItem(
        CartService.#STORAGE_KEY,
        JSON.stringify(CartService.#items)
      );
    } catch (e) {
      console.warn('[CartService] Erro ao persistir carrinho:', e);
    }
  }

  /** Carrega do localStorage (chamado na inicialização da classe) */
  static _loadFromStorage() {
    try {
      const raw = localStorage.getItem(CartService.#STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
