
const Toast = {
  _timer: null,

  show(message, duration = 2800) {
    const el = document.getElementById('lumyra-toast');
    if (!el) return;
    clearTimeout(Toast._timer);
    el.textContent = message;
    el.classList.add('show');
    Toast._timer = setTimeout(() => el.classList.remove('show'), duration);
  },
};

const Router = {
  /**
   * Detecta a página atual com base no pathname.
   * @returns {'home'|'colecoes'|'produto'|'checkout'|'sucesso'}
   */
  currentPage() {
    const path = window.location.pathname;
    if (path.includes('colecoes'))  return 'colecoes';
    if (path.includes('produto'))   return 'produto';
    if (path.includes('checkout'))  return 'checkout';
    if (path.includes('sucesso'))   return 'sucesso';
    return 'home';
  },

  /** Navega para uma rota, preservando os dados do carrinho via localStorage */
  go(path) {
    window.location.href = path;
  },

  /** Parâmetros da URL como objeto chave-valor */
  getParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  },
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') Header.closeCart();
});

window.LumyraApp = { Toast, Router, CartService, ProductService, StripeService };

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.info('%c Lumyra Store %c DEV MODE', 'background:#B8963E;color:#0E0D0B;padding:4px 8px;font-weight:700', 'background:#0E0D0B;color:#D4AF70;padding:4px 8px;');
  console.info('LumyraApp disponível no console:', window.LumyraApp);
}
