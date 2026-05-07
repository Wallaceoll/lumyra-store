/**
 * ProductService.js — Catálogo de Produtos
 * ─────────────────────────────────────────────────────────────
 * Responsabilidade única: fornecer dados dos produtos.
 *
 * Hoje: dados em memória (sem backend).
 * Amanhã: troque o método _getMockData() por um fetch real:
 *
 *   static async fetchAll() {
 *     const res = await fetch('/api/products');       // Spring Boot
 *     return res.json();
 *   }
 *
 * Nenhuma outra parte do sistema precisa mudar.
 * ─────────────────────────────────────────────────────────────
 */

class ProductService {

  /* ── CATEGORIAS DISPONÍVEIS ───────────────────────────────── */
  static CATEGORIES = {
    ALL:      'todas',
    JOIAS:    'joias',
    ALIANCAS: 'aliancas',
    RELOGIOS: 'relogios',
  };

  /* ── CATÁLOGO INTERNO ─────────────────────────────────────── */

  /** Retorna todos os produtos (Promise para simular assincronicidade) */
  static async fetchAll() {
    // Simula latência de rede — remova ao conectar ao backend real
    await ProductService._simulateDelay(120);
    return ProductService._getMockData();
  }

  /** Retorna um produto pelo ID */
  static async fetchById(id) {
    await ProductService._simulateDelay(80);
    const product = ProductService._getMockData().find(p => p.id === id);
    if (!product) throw new Error(`[ProductService] Produto não encontrado: ${id}`);
    return product;
  }

  /** Retorna produtos filtrados por categoria */
  static async fetchByCategory(category) {
    const all = await ProductService.fetchAll();
    if (category === ProductService.CATEGORIES.ALL) return all;
    return all.filter(p => p.cat === category);
  }

  /** Retorna os N produtos em destaque (featured: true) */
  static async fetchFeatured(limit = 5) {
    const all = await ProductService.fetchAll();
    return all.filter(p => p.featured).slice(0, limit);
  }

  /* ── DADOS MOCK ───────────────────────────────────────────── */

  static _getMockData() {
    return [
      {
        id:       '1',
        name:     'Pulseira Aurora Diamante',
        slug:     'pulseira-aurora-diamante',
        price:    4500,
        cat:      ProductService.CATEGORIES.JOIAS,
        catLabel: 'Joias — Pulseiras',
        img:      'https://d2xsxph8kpxj0f.cloudfront.net/310419663031337946/Ku9v2CQVjwUTZMhFkTPMBV/lumyra-hero-jewelry-iwzPvNEK2XAjVNiABVnt6L.webp',
        detail:   'Ouro 18k · 47 diamantes VS2 · 18cm',
        description: 'Pulseira em ouro 18 quilates com 47 diamantes VS2, lapidação brilhante. Fecho de segurança em ouro. Acompanha certificado de autenticidade e caixa Lumyra.',
        materials: ['Ouro 18k', 'Diamantes VS2', 'Fecho segurança ouro'],
        featured: true,
        gridSpan: 5,
      },
      {
        id:       '2',
        name:     'Par Eterno Ouro 18k',
        slug:     'par-eterno-ouro-18k',
        price:    3200,
        cat:      ProductService.CATEGORIES.ALIANCAS,
        catLabel: 'Alianças',
        img:      'https://d2xsxph8kpxj0f.cloudfront.net/310419663031337946/Ku9v2CQVjwUTZMhFkTPMBV/lumyra-wedding-rings-8pgCoY2ygKmYjyQFX3Nvty.webp',
        detail:   'Acabamento polido · Par · Gravação inclusa',
        description: 'Par de alianças em ouro 18 quilates com acabamento polido espelhado. Gravação personalizada inclusa. Disponível nos tamanhos 10 ao 30.',
        materials: ['Ouro 18k polido', 'Gravação a laser inclusa'],
        featured: true,
        gridSpan: 4,
      },
      {
        id:       '3',
        name:     'Cronógrafo Suíço 41mm',
        slug:     'cronografo-suico-41mm',
        price:    12000,
        cat:      ProductService.CATEGORIES.RELOGIOS,
        catLabel: 'Relógios',
        img:      'https://d2xsxph8kpxj0f.cloudfront.net/310419663031337946/Ku9v2CQVjwUTZMhFkTPMBV/lumyra-luxury-watch-N5ZzyWP3yVD6yprUmX7VQU.webp',
        detail:   'Movimento automático · Safira · 50m',
        description: 'Cronógrafo com movimento automático suíço, caixa em aço 316L, vidro de safira anti-reflectivo. Resistência à água de 50 metros.',
        materials: ['Caixa aço 316L', 'Movimento automático suíço', 'Vidro safira', 'Pulseira couro italiano'],
        featured: true,
        gridSpan: 3,
      },
      {
        id:       '4',
        name:     'Rubi & Diamante',
        slug:     'rubi-e-diamante',
        price:    8900,
        cat:      ProductService.CATEGORIES.JOIAS,
        catLabel: 'Coleção Especial',
        img:      'https://d2xsxph8kpxj0f.cloudfront.net/310419663031337946/Ku9v2CQVjwUTZMhFkTPMBV/lumyra-collection-showcase-3wp3wMcAZLdT9EHku89cK7.webp',
        detail:   'Rubi natural · Ouro branco 18k',
        description: 'Anel com rubi natural de 1.2ct e diamantes pavê em ouro branco 18 quilates. Pedra selecionada por especialista, acompanha laudo gemológico.',
        materials: ['Rubi natural 1.2ct', 'Diamantes pavê', 'Ouro branco 18k', 'Laudo gemológico'],
        featured: true,
        gridSpan: 4,
      },
      {
        id:       '5',
        name:     'Solitário 0.7ct GIA',
        slug:     'solitario-07ct-gia',
        price:    6400,
        cat:      ProductService.CATEGORIES.JOIAS,
        catLabel: 'Joias — Anéis',
        img:      'https://d2xsxph8kpxj0f.cloudfront.net/310419663031337946/Ku9v2CQVjwUTZMhFkTPMBV/lumyra-hero-jewelry-iwzPvNEK2XAjVNiABVnt6L.webp',
        detail:   'Diamante GIA H/SI1 · Ouro amarelo',
        description: 'Anel solitário clássico com diamante 0.7ct certificado GIA, cor H, pureza SI1. Montagem em ouro amarelo 18k com hastes afinadas.',
        materials: ['Diamante 0.7ct GIA', 'Cor H / Pureza SI1', 'Ouro amarelo 18k'],
        featured: true,
        gridSpan: 3,
      },
      {
        id:       '6',
        name:     'Brinco Argola Ouro',
        slug:     'brinco-argola-ouro',
        price:    1800,
        cat:      ProductService.CATEGORIES.JOIAS,
        catLabel: 'Joias — Brincos',
        img:      'https://d2xsxph8kpxj0f.cloudfront.net/310419663031337946/Ku9v2CQVjwUTZMhFkTPMBV/lumyra-collection-showcase-3wp3wMcAZLdT9EHku89cK7.webp',
        detail:   'Ouro 18k · Ø 35mm · Par',
        description: 'Brinco argola em ouro 18k com acabamento polido. Diâmetro 35mm. Fecho de segurança. Ideal para uso diário com elegância.',
        materials: ['Ouro 18k polido', 'Fecho de pressão'],
        featured: false,
      },
      {
        id:       '7',
        name:     'Aliança Rose Gold',
        slug:     'alianca-rose-gold',
        price:    2600,
        cat:      ProductService.CATEGORIES.ALIANCAS,
        catLabel: 'Alianças',
        img:      'https://d2xsxph8kpxj0f.cloudfront.net/310419663031337946/Ku9v2CQVjwUTZMhFkTPMBV/lumyra-wedding-rings-8pgCoY2ygKmYjyQFX3Nvty.webp',
        detail:   'Rose gold 18k · Acabamento escovado · Par',
        description: 'Par de alianças em rose gold 18k com acabamento escovado. Design contemporâneo que mistura o tradicional com o moderno.',
        materials: ['Rose gold 18k', 'Acabamento escovado'],
        featured: false,
      },
      {
        id:       '8',
        name:     'Relógio Slim Automático',
        slug:     'relogio-slim-automatico',
        price:    7200,
        cat:      ProductService.CATEGORIES.RELOGIOS,
        catLabel: 'Relógios',
        img:      'https://d2xsxph8kpxj0f.cloudfront.net/310419663031337946/Ku9v2CQVjwUTZMhFkTPMBV/lumyra-luxury-watch-N5ZzyWP3yVD6yprUmX7VQU.webp',
        detail:   'Slim 8mm · Automático · Couro',
        description: 'Relógio de perfil ultra-slim (8mm) com movimento automático. Caixa em titânio, vidro de safira. Pulseira em couro italiano costurado à mão.',
        materials: ['Caixa titânio', 'Movimento automático', 'Vidro safira', 'Couro italiano'],
        featured: false,
      },
    ];
  }

  /* ── HELPER PRIVADO ───────────────────────────────────────── */

  static _simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
