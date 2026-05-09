
class Header {

  /**
   * Mapa de rotas: nome da aba → caminho relativo ao index
   * Para subpastas (/pages/*), o prefixo "../" é adicionado
   * automaticamente por _resolvePath().
   */
  static ROUTES = {
    'Início': '/index.html',
    'Joias': '/pages/joias.html',
    'Coleções': '/pages/colecoes.html',
    'Alianças': '/pages/aliancas.html',
    'Relógios': '/pages/relogios.html',
    'Presentes': '/pages/presentes.html',
  };

  /** Ponto de entrada — chamado no DOMContentLoaded de cada página */
  static init() {
    Header._injectCursor();
    Header._injectNavbar();
    Header._injectCartDrawer();
    Header._injectToast();
    Header._bindScrollBehavior();
    Header._bindCursorBehavior();
    Header._setupRevealObserver();

    // Atualiza o contador do carrinho ao iniciar
    CartService.onChange(Header.updateCartBadge);
    Header.updateCartBadge(CartService.getCount());
  }


  static _injectCursor() {
    if (document.getElementById('lumyra-cursor')) return;
    const el = document.createElement('div');
    el.id = 'lumyra-cursor';
    document.body.prepend(el);
  }

  static _injectNavbar() {
    if (document.getElementById('lmr-nav')) return;

    const isSubpage = window.location.pathname.includes('/pages/');
    const base = isSubpage ? '../' : '';

    const nav = document.createElement('nav');
    nav.id = 'lmr-nav';
    nav.innerHTML = `
      <a href="${base}index.html" class="nav-logo">Lum<span>y</span>ra</a>

      <ul class="nav-links" id="navLinks">
        ${Object.entries(Header.ROUTES).map(([label, path]) => `
          <li class="${['Joias', 'Coleções', 'Presentes', 'Alianças', 'Relógios'].includes(label) ? 'has-mega' : ''}">
            <a href="${Header._resolvePath(path)}"
               class="${Header._isActive(path) ? 'active' : ''}">
              ${label}
            </a>
            ${Header._getMegaMenu(label)}
          </li>
        `).join('')}
      </ul>

      <div class="nav-actions">
        <button class="theme-toggle" id="themeToggle" aria-label="Alternar tema">
          <svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="display:none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button class="nav-cart-btn" id="navCartBtn" aria-label="Abrir carrinho">
          Carrinho
          <span class="cart-badge" id="cartBadge" aria-live="polite">0</span>
        </button>
        <button class="nav-menu-btn" id="navMenuBtn" aria-label="Menu mobile" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    `;

    document.body.prepend(nav);

    document.getElementById('navCartBtn').addEventListener('click', Header.toggleCart);
    document.getElementById('navMenuBtn').addEventListener('click', Header._toggleMobileMenu);
    document.getElementById('themeToggle').addEventListener('click', Header._toggleTheme);

    // Aplica tema salvo
    Header._applyTheme(localStorage.getItem('lumyra_theme') || 'light');
  }

  static _injectCartDrawer() {
    if (document.getElementById('cartOverlay')) return;

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    overlay.id = 'cartOverlay';
    overlay.addEventListener('click', Header.toggleCart);
    document.body.appendChild(overlay);

    // Drawer
    const drawer = document.createElement('div');
    drawer.className = 'cart-drawer';
    drawer.id = 'cartDrawer';
    drawer.innerHTML = `
      <div class="cart-header">
        <h2 class="cart-title">Carrinho</h2>
        <button class="cart-close" id="cartClose" aria-label="Fechar carrinho">×</button>
      </div>
      <div class="cart-items" id="cartItems"></div>
      <div class="cart-footer" id="cartFooter" style="display:none">
        <div class="cart-total">
          <span class="cart-total-label">Total</span>
          <span class="cart-total-price" id="cartTotalPrice">R$ 0</span>
        </div>
        <p class="cart-sub">Frete grátis · Parcelamento em até 12×</p>
        <button class="checkout-btn" id="goToCheckout">
          Finalizar pedido
          <svg width="18" height="11" viewBox="0 0 20 12" fill="none" aria-hidden="true">
            <path d="M0 6h18M13 1l6 5-6 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(drawer);

    document.getElementById('cartClose').addEventListener('click', Header.toggleCart);
    document.getElementById('goToCheckout').addEventListener('click', () => {
      const isSubpage = window.location.pathname.includes('/pages/');
      const base = isSubpage ? '../' : '';
      window.location.href = `${base}pages/checkout.html`;
    });

    // Renderiza estado inicial do carrinho
    Header._renderCartItems();
    CartService.onChange(() => Header._renderCartItems());
  }

  static _injectToast() {
    if (document.getElementById('lumyra-toast')) return;
    const el = document.createElement('div');
    el.id = 'lumyra-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }


  static _renderCartItems() {
    const container = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartTotalPrice');
    if (!container) return;

    const items = CartService.getItems();

    if (items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-title">Vazio por ora</div>
          <div class="cart-empty-sub">
            Escolha uma peça que faz sentido<br>para você e adicione aqui.
          </div>
        </div>`;
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = 'block';
    if (totalEl) totalEl.textContent = CartService.formatCurrency(CartService.getTotal());

    container.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item-img" src="${item.img}" alt="${item.name}" loading="lazy">
        <div>
          <div class="cart-item-cat">${item.cat}</div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-qty">
            <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Diminuir quantidade">−</button>
            <span class="qty-val" aria-label="Quantidade: ${item.qty}">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
            <button class="remove-btn" data-action="remove" data-id="${item.id}" aria-label="Remover item">Remover</button>
          </div>
        </div>
        <div class="cart-item-price">${CartService.formatCurrency(item.price * item.qty)}</div>
      </div>
    `).join('');

    // Delega eventos de quantidade
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const { action, id } = btn.dataset;
        if (action === 'inc') CartService.updateQty(id, 1);
        if (action === 'dec') CartService.updateQty(id, -1);
        if (action === 'remove') CartService.remove(id);
      });
    });
  }


  static updateCartBadge(count) {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  }


  static toggleCart() {
    document.getElementById('cartOverlay')?.classList.toggle('open');
    document.getElementById('cartDrawer')?.classList.toggle('open');
  }

  static closeCart() {
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.getElementById('cartDrawer')?.classList.remove('open');
  }


  static _toggleTheme() {
    const current = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    Header._applyTheme(next);
  }

  static _applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('lumyra_theme', theme);

    // Atualiza ícones
    const sun = document.querySelector('.sun-icon');
    const moon = document.querySelector('.moon-icon');
    if (sun && moon) {
      sun.style.display = isDark ? 'none' : 'block';
      moon.style.display = isDark ? 'block' : 'none';
    }
  }


  static _toggleMobileMenu() {
    const links = document.getElementById('navLinks');
    const btn = document.getElementById('navMenuBtn');
    if (!links) return;
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  }


  static _bindScrollBehavior() {
    const nav = document.getElementById('lmr-nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // estado inicial
  }


  static _bindCursorBehavior() {
    const cursor = document.getElementById('lumyra-cursor');
    if (!cursor) return;

    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    }, { passive: true });

    // Aplica efeito de hover nos elementos interativos
    const hoverTargets = 'a, button, .product-card, [data-hover]';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverTargets)) cursor.classList.add('hovering');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverTargets)) cursor.classList.remove('hovering');
    });
  }


  static _setupRevealObserver() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }


  /** Resolve path relativo dependendo da página atual */
  static _resolvePath(path) {
    if (path.startsWith('http')) return path;
    const isSubpage = window.location.pathname.includes('/pages/');
    // Âncoras do index precisam de prefixo quando em subpágina
    if (path.startsWith('/#')) return isSubpage ? `../index.html${path.slice(1)}` : path;
    return isSubpage ? `..${path}` : path;
  }

  /** Marca o link ativo com base na URL atual */
  static _isActive(path) {
    const current = window.location.pathname;
    if (path === '/' && (current === '/' || current.endsWith('index.html'))) return true;
    return path && current.includes(path.split('?')[0].replace(/^\//, ''));
  }

  /** Retorna o HTML do Mega Menu para uma determinada aba */
  static _getMegaMenu(label) {
    const isSubpage = window.location.pathname.includes('/pages/');
    const base = isSubpage ? '' : 'pages/';

    const menus = {
      'Joias': `
        <div class="mega-menu">
          <div class="mega-col">
            <h4>Categorias</h4>
            <ul class="mega-list">
              <li><a href="${base}joias.html?cat=aneis">Anéis</a></li>
              <li><a href="${base}joias.html?cat=brincos">Brincos</a></li>
              <li><a href="${base}joias.html?cat=colares">Colares</a></li>
              <li><a href="${base}joias.html?cat=pulseiras">Pulseiras</a></li>
            </ul>
          </div>
          <div class="mega-col">
            <h4>Destaques</h4>
            <ul class="mega-list">
              <li><a href="${base}joias.html?filter=new">Novas Peças</a></li>
              <li><a href="${base}joias.html?filter=conjunto">Conjuntos Exclusivos</a></li>
              <li><a href="${base}joias.html?filter=oferta">Ofertas da Estação</a></li>
            </ul>
          </div>
        </div>`,
      'Coleções': `
        <div class="mega-menu">
          <div class="mega-col">
            <h4>Linhas</h4>
            <ul class="mega-list">
              <li><a href="${base}colecoes.html?linha=essenciais">Essenciais Lumyra</a></li>
              <li><a href="${base}colecoes.html?linha=diamantes">Diamantes Certificados</a></li>
              <li><a href="${base}colecoes.html?linha=2026">Coleção 2026</a></li>
            </ul>
          </div>
          <div class="mega-col">
            <h4>Inpiração</h4>
            <ul class="mega-list">
              <li><a href="${base}colecoes.html?filter=editorial">Editorial 2024</a></li>
              <li><a href="${base}colecoes.html?filter=artesanal">O Processo Artesanal</a></li>
            </ul>
          </div>
        </div>`,
      'Alianças': `
        <div class="mega-menu">
          <div class="mega-col">
            <h4>Estilos</h4>
            <ul class="mega-list">
              <li><a href="${base}aliancas.html?estilo=tradicional">Tradicionais</a></li>
              <li><a href="${base}aliancas.html?estilo=moderna">Modernas</a></li>
              <li><a href="${base}aliancas.html?estilo=cravejada">Cravejadas</a></li>
            </ul>
          </div>
          <div class="mega-col">
            <h4>Ocasião</h4>
            <ul class="mega-list">
              <li><a href="${base}aliancas.html?ocasiao=noivado">Noivado</a></li>
              <li><a href="${base}aliancas.html?ocasiao=casamento">Casamento</a></li>
              <li><a href="${base}aliancas.html?ocasiao=bodas">Bodas</a></li>
            </ul>
          </div>
        </div>`,
      'Relógios': `
        <div class="mega-menu">
          <div class="mega-col">
            <h4>Gênero</h4>
            <ul class="mega-list">
              <li><a href="${base}relogios.html?genero=feminino">Femininos</a></li>
              <li><a href="${base}relogios.html?genero=masculino">Masculinos</a></li>
            </ul>
          </div>
          <div class="mega-col">
            <h4>Estilo</h4>
            <ul class="mega-list">
              <li><a href="${base}relogios.html?estilo=social">Social</a></li>
              <li><a href="${base}relogios.html?filter=conjunto">Kit Relógio + Acessório</a></li>
              <li><a href="${base}relogios.html?filter=oferta">Promoções</a></li>
            </ul>
          </div>
        </div>`,
      'Presentes': `
        <div class="mega-menu">
          <div class="mega-col">
            <h4>Por Valor</h4>
            <ul class="mega-list">
              <li><a href="${base}presentes.html?preco=ate-1000">Até R$ 1.000</a></li>
              <li><a href="${base}presentes.html?preco=1000-5000">R$ 1.000 - R$ 5.000</a></li>
              <li><a href="${base}presentes.html?preco=acima-5000">Acima de R$ 5.000</a></li>
            </ul>
          </div>
          <div class="mega-col">
            <h4>Por Ocasião</h4>
            <ul class="mega-list">
              <li><a href="${base}presentes.html?ocasiao=aniversario">Aniversário</a></li>
              <li><a href="${base}presentes.html?ocasiao=formatura">Formatura</a></li>
              <li><a href="${base}presentes.html?ocasiao=maternidade">Maternidade</a></li>
            </ul>
          </div>
        </div>`
    };
    return menus[label] || '';
  }
}

(function _injectHeaderStyles() {
  if (document.getElementById('lmr-header-styles')) return;
  const style = document.createElement('style');
  style.id = 'lmr-header-styles';
  style.textContent = `
    #lmr-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 24px 64px;
      transition: background 0.4s ease, padding 0.4s ease, border-color 0.4s;
    }
    #lmr-nav.scrolled {
      background: var(--bg);
      backdrop-filter: blur(12px);
      padding: 16px 64px;
      border-bottom: 1px solid var(--border);
    }

    .nav-logo {
      font-family: var(--font-display);
      font-size: 26px; font-weight: 300;
      letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--text);
      transition: color 0.3s;
    }
    .nav-logo span { color: var(--gold); }

    .nav-links {
      display: flex; gap: 40px; list-style: none;
    }
    .nav-links a {
      font-size: 13px; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--text);
      text-decoration: none; position: relative;
      transition: color 0.3s;
    }
    .nav-links a::after {
      content: ''; position: absolute;
      bottom: -4px; left: 0;
      width: 0; height: 1px;
      background: var(--gold);
      transition: width 0.3s ease;
    }
    .nav-links a:hover,
    .nav-links a.active { color: var(--gold); }
    .nav-links a:hover::after,
    .nav-links a.active::after { width: 100%; }

    .nav-actions { display: flex; gap: 16px; align-items: center; }

    .theme-toggle {
      background: none; border: none; cursor: none;
      color: var(--text); padding: 8px;
      display: flex; align-items: center; justify-content: center;
      transition: color 0.3s;
    }
    .theme-toggle:hover { color: var(--gold); }

    .nav-cart-btn {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;
      background: var(--text); color: var(--bg);
      border: none; padding: 10px 20px; cursor: none;
      transition: background 0.3s;
    }
    .nav-cart-btn:hover { background: var(--gold); }

    .cart-badge {
      min-width: 18px; height: 18px;
      background: var(--gold); color: #0E0D0B;
      border-radius: 50%; font-size: 10px; font-weight: 700;
      display: none; align-items: center; justify-content: center;
      padding: 0 4px;
    }
    .cart-badge.visible { display: flex; }

    /* Menu hamburger mobile */
    .nav-menu-btn {
      display: none; flex-direction: column;
      gap: 5px; background: none; border: none;
      cursor: none; padding: 4px;
    }
    .nav-menu-btn span {
      display: block; width: 22px; height: 1.5px;
      background: var(--text); transition: all 0.3s;
    }

    @media (max-width: 1024px) {
      #lmr-nav { padding: 20px 32px; }
      #lmr-nav.scrolled { padding: 14px 32px; }
      .nav-links {
        display: none; position: fixed;
        top: 72px; left: 0; right: 0;
        background: var(--bg);
        border-bottom: 1px solid var(--border);
        flex-direction: column; gap: 0; padding: 8px 0;
      }
      .nav-links.open { display: flex; }
      .nav-links li a { display: block; padding: 14px 32px; }
      .nav-menu-btn { display: flex; }
    }
    @media (max-width: 640px) {
      #lmr-nav { padding: 18px 24px; }
      #lmr-nav.scrolled { padding: 12px 24px; }
    }
  `;
  document.head.appendChild(style);
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Header.init());
} else {
  Header.init();
}
