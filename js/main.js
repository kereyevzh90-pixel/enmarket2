/* =====================
   HEADER SCROLL
   ===================== */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

/* =====================
   MOBILE MENU
   ===================== */
function toggleMenu() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  nav.classList.toggle('open');
  burger.classList.toggle('active');
}

// Close nav on link click
document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('nav').classList.remove('open');
    document.getElementById('burger').classList.remove('active');
  });
});

/* =====================
   SEARCH BAR
   ===================== */
function toggleSearch() {
  document.getElementById('searchBar').classList.toggle('open');
  if (document.getElementById('searchBar').classList.contains('open')) {
    document.querySelector('.search-input').focus();
  }
}

/* =====================
   CART SIDEBAR
   ===================== */
function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
  document.body.style.overflow =
    document.getElementById('cartSidebar').classList.contains('open') ? 'hidden' : '';
}

/* =====================
   LOAD PRODUCTS
   ===================== */
let allProducts = [];

async function loadProducts() {
  try {
    const r = await fetch('products.json?t=' + Date.now());
    allProducts = await r.json();
    renderCatalog(allProducts);
  } catch (e) {
    console.error('Не удалось загрузить товары', e);
  }
}

function renderCatalog(list) {
  const grid  = document.getElementById('productsGrid');
  const empty = document.querySelector('.empty-state');

  if (!list || !list.length) {
    if (empty) empty.style.display = '';
    grid.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  grid.style.display = 'grid';

  grid.innerHTML = list.map(p => `
    <div class="product-card">
      <div class="product-card__img">
        ${p.image
          ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.style.display='none'" />`
          : `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
        }
        ${p.badge ? `<span class="product-card__badge">${esc(p.badge)}</span>` : ''}
        ${!p.inStock ? `<span class="product-card__badge product-card__badge--out">Нет в наличии</span>` : ''}
      </div>
      <div class="product-card__body">
        ${p.category ? `<span class="product-card__cat">${esc(p.category)}</span>` : ''}
        <h3 class="product-card__name">${esc(p.name)}</h3>
        ${p.description ? `<p class="product-card__desc">${esc(p.description)}</p>` : ''}
        <div class="product-card__footer">
          <div class="product-card__prices">
            <span class="product-card__price">${fmtPrice(p.price)}</span>
            ${p.oldPrice ? `<span class="product-card__old">${fmtPrice(p.oldPrice)}</span>` : ''}
          </div>
          <button class="btn-cart ${!p.inStock ? 'btn-cart--disabled' : ''}"
            onclick="${p.inStock ? `addToCart('${p.id}')` : ''}"
            ${!p.inStock ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmtPrice(n) {
  return Number(n).toLocaleString('ru-RU') + ' ₽';
}

loadProducts();

/* =====================
   CART
   ===================== */
let cart = JSON.parse(localStorage.getItem('em_cart') || '[]');

function addToCart(id) {
  const p = allProducts.find(p => p.id === id);
  if (!p) return;
  const existing = cart.find(c => c.id === id);
  if (existing) { existing.qty++; } else { cart.push({ ...p, qty: 1 }); }
  localStorage.setItem('em_cart', JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
  showToast(`«${p.name}» добавлен в корзину`);
}

function updateCartCount() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  const el = document.getElementById('cartCount');
  el.textContent = total || '';
  el.style.display = total ? 'flex' : 'none';
}

function renderCartItems() {
  const body = document.querySelector('.cart-sidebar__body');
  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      <p>Корзина пуста</p>
      <button class="btn btn--primary" onclick="toggleCart()">Перейти в каталог</button>
    </div>`;
    return;
  }

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  body.innerHTML = `
    <div class="cart-list">
      ${cart.map(c => `
        <div class="cart-item">
          <div class="cart-item__img">
            ${c.image ? `<img src="${esc(c.image)}" alt="" onerror="this.style.display='none'" />` : ''}
          </div>
          <div class="cart-item__info">
            <div class="cart-item__name">${esc(c.name)}</div>
            <div class="cart-item__price">${fmtPrice(c.price)}</div>
          </div>
          <div class="cart-item__qty">
            <button onclick="changeQty('${c.id}', -1)">−</button>
            <span>${c.qty}</span>
            <button onclick="changeQty('${c.id}', 1)">+</button>
          </div>
          <button class="cart-item__del" onclick="removeFromCart('${c.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `).join('')}
      <div class="cart-total">
        <span>Итого:</span>
        <strong>${fmtPrice(total)}</strong>
      </div>
      <button class="btn btn--primary" style="width:100%;justify-content:center" onclick="showToast('Оформление заказа скоро будет доступно!')">Оформить заказ</button>
    </div>
  `;
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  localStorage.setItem('em_cart', JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  localStorage.setItem('em_cart', JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
}

updateCartCount();
renderCartItems();

/* =====================
   FILTER BUTTONS
   ===================== */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const label = btn.textContent.trim();
    if (label === 'Все') { renderCatalog(allProducts); return; }
    if (label === 'Новинки') { renderCatalog(allProducts.filter(p => p.badge === 'Новинка')); return; }
    if (label === 'Популярное') { renderCatalog(allProducts.filter(p => p.badge === 'Хит')); return; }
    if (label === 'Скидки') { renderCatalog(allProducts.filter(p => p.oldPrice)); return; }
  });
});

/* =====================
   TOAST
   ===================== */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* =====================
   SUBSCRIBE
   ===================== */
function subscribeEmail(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  if (input.value) {
    showToast('Вы подписались! Скидка 10% уже на вашем e-mail.');
    input.value = '';
  }
}

/* =====================
   CONTACT FORM
   ===================== */
function sendMessage(e) {
  e.preventDefault();
  showToast('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
  e.target.reset();
}

/* =====================
   SMOOTH SCROLL (fallback)
   ===================== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* =====================
   ANIMATE ON SCROLL
   ===================== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.feature, .empty-state, .about__content, .contact__form').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});

// Add visible class styles via JS
const style = document.createElement('style');
style.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);
