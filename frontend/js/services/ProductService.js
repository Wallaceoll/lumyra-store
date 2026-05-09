
class ProductService {

    static CATEGORIES = {
    ALL:      'todas',
    JOIAS:    'joias',
    ALIANCAS: 'aliancas',
    RELOGIOS: 'relogios',
  };

  
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

  
  static _getMockData() {
    return [
      // [JOIAS - ANÉIS]
      {
        id: 'j1',
        name: 'Anel Solitário Essence',
        price: 3200,
        cat: ProductService.CATEGORIES.JOIAS,
        subCat: 'aneis',
        catLabel: 'Joias — Anéis',
        img: '../assets/images/products/aneis_collection_1.png',
        detail: 'Ouro Amarelo 18k · Diamante 0.5ct',
        description: 'Um clássico eterno que celebra a pureza do diamante central em uma montagem minimalista.',
        featured: true,
        type: 'Anel'
      },
      {
        id: 'j2',
        name: 'Anel Eternity Diamond',
        price: 5800,
        cat: ProductService.CATEGORIES.JOIAS,
        subCat: 'aneis',
        catLabel: 'Joias — Anéis',
        img: '../assets/images/products/aneis_collection_1.png',
        detail: 'Ouro Branco 18k · Pavê de Diamantes',
        description: 'Elegância contínua com diamantes cravejados em toda a volta da peça.',
        featured: false,
        type: 'Anel'
      },
      {
        id: 'j3',
        name: 'Anel Vintage Sapphire',
        price: 4500,
        cat: ProductService.CATEGORIES.JOIAS,
        subCat: 'aneis',
        catLabel: 'Joias — Anéis',
        img: '../assets/images/products/aneis_collection_1.png',
        detail: 'Safira Azul · Ouro 18k',
        description: 'Inspirado na realeza, este anel traz uma safira central profunda rodeada por diamantes.',
        featured: true,
        type: 'Anel'
      },

      // [JOIAS - BRINCOS]
      {
        id: 'j4',
        name: 'Brincos de Pérola Real',
        price: 1500,
        cat: ProductService.CATEGORIES.JOIAS,
        subCat: 'brincos',
        catLabel: 'Joias — Brincos',
        img: '../assets/images/products/brincos_collection_1.png',
        detail: 'Pérolas Naturais · Ouro 18k',
        description: 'A sofisticação atemporal das pérolas selecionadas com acabamento em ouro.',
        featured: true,
        type: 'Brinco'
      },
      {
        id: 'j5',
        name: 'Argolas Diamantadas',
        price: 2400,
        cat: ProductService.CATEGORIES.JOIAS,
        subCat: 'brincos',
        catLabel: 'Joias — Brincos',
        img: '../assets/images/products/brincos_collection_1.png',
        detail: 'Ouro 18k · Textura Diamantada',
        description: 'Argolas clássicas com um toque moderno de brilho extra através da textura.',
        featured: false,
        type: 'Brinco'
      },
      {
        id: 'j6',
        name: 'Brincos Cascade Diamond',
        price: 9200,
        cat: ProductService.CATEGORIES.JOIAS,
        subCat: 'brincos',
        catLabel: 'Joias — Brincos',
        img: '../assets/images/products/brincos_collection_1.png',
        detail: 'Diamantes VS1 · Ouro Branco',
        description: 'Movimento e brilho excepcionais em uma cascata de diamantes de alta pureza.',
        featured: true,
        type: 'Brinco'
      },

      // [JOIAS - COLARES]
      {
        id: 'j7',
        name: 'Colar Ponto de Luz',
        price: 1200,
        cat: ProductService.CATEGORIES.JOIAS,
        subCat: 'colares',
        catLabel: 'Joias — Colares',
        img: '../assets/images/products/colares_collection_1.png',
        detail: 'Diamante 0.1ct · Corrente Ouro 18k',
        description: 'O detalhe perfeito para o dia a dia, discreto e extremamente luxuoso.',
        featured: true,
        type: 'Colar'
      },
      {
        id: 'j8',
        name: 'Colar Riviera Diamond',
        price: 18500,
        cat: ProductService.CATEGORIES.JOIAS,
        subCat: 'colares',
        catLabel: 'Joias — Colares',
        img: '../assets/images/products/colares_collection_1.png',
        detail: 'Diamantes de 3mm · Ouro 18k',
        description: 'A joia definitiva. Um fluxo contínuo de diamantes que ilumina o colo.',
        featured: true,
        type: 'Colar'
      },

      // [ALIANÇAS]
      {
        id: 'a1',
        name: 'Par Aliança Infinito',
        price: 4200,
        cat: ProductService.CATEGORIES.ALIANCAS,
        catLabel: 'Alianças de Casamento',
        img: '../assets/images/products/aliancas_collection_1.png',
        detail: 'Ouro 18k · Anatômicas · 6mm',
        description: 'Conforto e design em uma peça que simboliza a união eterna.',
        featured: true,
        type: 'Aliança'
      },
      {
        id: 'a2',
        name: 'Par Aliança Roman',
        price: 3800,
        cat: ProductService.CATEGORIES.ALIANCAS,
        catLabel: 'Alianças de Casamento',
        img: '../assets/images/products/aliancas_collection_1.png',
        detail: 'Ouro Amarelo · Detalhes em Relevo',
        description: 'Inspirada na arquitetura clássica, traz detalhes lineares em relevo.',
        featured: false,
        type: 'Aliança'
      },
      {
        id: 'a3',
        name: 'Aliança Noivado Promise',
        price: 3500,
        cat: ProductService.CATEGORIES.ALIANCAS,
        catLabel: 'Alianças de Noivado',
        img: '../assets/images/products/aliancas_collection_1.png',
        detail: 'Diamante Central · Ouro Rose 18k',
        description: 'A delicadeza do ouro rose combinada com o brilho de um diamante solitário.',
        featured: true,
        type: 'Aliança'
      },

      // [RELÓGIOS]
      {
        id: 'r1',
        name: 'Relógio Master Chrono',
        price: 15000,
        cat: ProductService.CATEGORIES.RELOGIOS,
        catLabel: 'Relógios de Luxo',
        img: '../assets/images/products/relogios_collection_1.png',
        detail: 'Cronógrafo Automático · Safira',
        description: 'Precisão suíça em um design robusto e elegante de 42mm.',
        featured: true,
        type: 'Relógio'
      },
      {
        id: 'r2',
        name: 'Relógio Heritage Leather',
        price: 8900,
        cat: ProductService.CATEGORIES.RELOGIOS,
        catLabel: 'Relógios Clássicos',
        img: '../assets/images/products/relogios_collection_1.png',
        detail: 'Movimento Quartz · Couro de Jacaré',
        description: 'O clássico que nunca sai de moda, com pulseira artesanal em couro nobre.',
        featured: false,
        type: 'Relógio'
      },
      {
        id: 'r3',
        name: 'Relógio Ocean Diver',
        price: 12500,
        cat: ProductService.CATEGORIES.RELOGIOS,
        catLabel: 'Relógios Esportivos',
        img: '../assets/images/products/relogios_collection_1.png',
        detail: 'Resistente 300m · Bisel Cerâmico',
        description: 'Performance e luxo para quem não tem medo das profundezas.',
        featured: true,
        type: 'Relógio'
      },

      // [PRESENTES]
      {
        id: 'p1',
        name: 'Kit Celebração Premium',
        price: 2500,
        cat: 'presentes',
        catLabel: 'Kits de Presente',
        img: '../assets/images/products/presentes_collection_1.png',
        detail: 'Joia + Vinho + Embalagem Luxo',
        description: 'A experiência completa para surpreender quem você ama.',
        featured: true,
        type: 'Presente'
      },
      {
        id: 'p2',
        name: 'Conjunto Noite de Gala',
        price: 4900,
        cat: 'presentes',
        catLabel: 'Kits de Presente',
        img: '../assets/images/products/presentes_collection_1.png',
        detail: 'Colar & Brincos Harmonizados',
        description: 'Facilidade na escolha com uma combinação perfeita de peças.',
        featured: false,
        type: 'Presente'
      },
      {
        id: 'p3',
        name: 'Gift Box Essentials',
        price: 1800,
        cat: 'presentes',
        catLabel: 'Kits de Presente',
        img: '../assets/images/products/presentes_collection_1.png',
        detail: 'Brincos de Prata · Velas Aromáticas',
        description: 'Um presente delicado e completo para momentos de autocuidado.',
        featured: true,
        type: 'Presente'
      }
    ];
  }

  
  static _simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
