/* ===================== HEADER SCROLL ===================== */
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 10);
});

/* ===================== BURGER ===================== */
function toggleMenu() {
  document.getElementById('nav').classList.toggle('open');
}
document.querySelectorAll('.nav__item').forEach(l => {
  l.addEventListener('click', () => document.getElementById('nav').classList.remove('open'));
});

/* ===================== SEARCH ===================== */
document.getElementById('searchInput').addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  renderGrid(q ? allProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.category||'').toLowerCase().includes(q) ||
    (p.brand||'').toLowerCase().includes(q)
  ) : applyFiltersResult());
});

function selectCatFilter(cat, label) {
  document.getElementById('catFilterLabel').textContent = label;
  const btn = document.getElementById('catFilterBtn');
  btn.classList.toggle('active', cat !== '');
  filterCat(cat);
  closeDropdowns();
  updateResetBtn();
}

/* ===================== SIDEBAR CATS ===================== */
function toggleScat(el) {
  el.classList.toggle('open');
  el.nextElementSibling.classList.toggle('open');
}

function filterSubcat(cat, subcat) {
  activeCat = cat;
  activeSubcat = subcat;
  document.getElementById('catalogTitle').textContent = subcat;
  renderGrid(applyFiltersResult());
  document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
  return false;
}

/* ===================== TABS ===================== */
function setTab(btn, val) {
  document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const titles = { '': 'Все товары', new: 'Новинки', sale: 'Скидки', women: 'Женщинам', men: 'Мужчинам', kids: 'Детям' };
  document.getElementById('catalogTitle').textContent = titles[val] || 'Все товары';
  activeCat = val;
  activeSubcat = '';
  renderGrid(applyFiltersResult());
}

/* ===================== DROPDOWNS ===================== */
function toggleDropdown(id) {
  const el = document.getElementById(id);
  const isOpen = el.classList.contains('open');
  closeDropdowns();
  if (!isOpen) {
    el.classList.add('open');
    el.previousElementSibling.classList.add('active');
    if (id === 'dropBrand') filterBrandList('');
  }
}
function closeDropdowns() {
  document.querySelectorAll('.hfilter-drop').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.hfilter-btn').forEach(b => b.classList.remove('active'));
}
document.addEventListener('click', e => {
  if (!e.target.closest('.hfilter-group')) closeDropdowns();
});

/* ===================== FILTERS ===================== */

let selectedSizes  = [];
let selectedColors = [];
let selectedBrands = [];
let saleOnly = false;
let activeCat = '';
let activeSubcat = '';

function updateFilterLabel(labelId, btnId, values, defaultText) {
  const label = document.getElementById(labelId);
  const btn   = document.getElementById(btnId);
  if (values.length === 0) {
    label.textContent = defaultText;
    btn.classList.remove('active');
  } else {
    label.textContent = values.length === 1 ? values[0] : `${defaultText}: ${values.length}`;
    btn.classList.add('active');
  }
}

function toggleSize(btn, size) {
  btn.classList.toggle('active');
  selectedSizes = selectedSizes.includes(size)
    ? selectedSizes.filter(s => s !== size)
    : [...selectedSizes, size];
  updateFilterLabel('sizeFilterLabel', 'sizeFilterBtn', selectedSizes, 'Размер');
  applyFilters();
  updateResetBtn();
}

function applyFilters() { renderGrid(applyFiltersResult()); }

function applyFiltersResult() {
  const minPrice = Number(document.getElementById('priceMin').value) || 0;
  const maxPrice = Number(document.getElementById('priceMax').value) || Infinity;

  return allProducts.filter(p => {
    if (activeCat === 'new')  return p.badge === 'Новинка';
    if (activeCat === 'sale') return !!p.oldPrice;
    if (activeCat && p.category !== activeCat) return false;
    if (activeSubcat && !(p.subcategory||'').includes(activeSubcat) && !(p.name||'').includes(activeSubcat)) return false;
    if (p.price < minPrice || p.price > maxPrice) return false;
    if (selectedSizes.length && !selectedSizes.some(s => (p.sizes||[]).includes(s))) return false;
    if (selectedColors.length && !selectedColors.includes(p.color)) return false;
    if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
    if (saleOnly && !p.oldPrice) return false;
    return true;
  });
}

function toggleColor(btn, color) {
  btn.classList.toggle('active');
  selectedColors = selectedColors.includes(color)
    ? selectedColors.filter(c => c !== color)
    : [...selectedColors, color];
  updateFilterLabel('colorFilterLabel', 'colorFilterBtn', selectedColors, 'Цвет');
  applyFilters();
  updateResetBtn();
}

function toggleSaleFilter(btn) {
  saleOnly = !saleOnly;
  btn.classList.toggle('active', saleOnly);
  applyFilters();
  updateResetBtn();
}

function filterBrandList(q) {
  const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))];
  const list = document.getElementById('brandList');
  const filtered = brands.filter(b => b.toLowerCase().includes(q.toLowerCase()));
  list.innerHTML = filtered.map(b => `
    <label>
      <input type="checkbox" ${selectedBrands.includes(b) ? 'checked' : ''} onchange="toggleBrand('${esc(b)}',this)" />
      ${esc(b)}
    </label>
  `).join('');
}

function toggleBrand(brand, cb) {
  selectedBrands = cb.checked
    ? [...selectedBrands, brand]
    : selectedBrands.filter(b => b !== brand);
  updateFilterLabel('brandFilterLabel', 'brandFilterBtn', selectedBrands, 'Бренд');
  applyFilters();
  updateResetBtn();
}

function updatePriceLabel() {
  const min = document.getElementById('priceMin').value;
  const max = document.getElementById('priceMax').value;
  const btn = document.getElementById('priceFilterBtn');
  const label = document.getElementById('priceFilterLabel');
  if (min || max) {
    label.textContent = (min || '0') + ' — ' + (max || '∞') + ' ₸';
    btn.classList.add('active');
  } else {
    label.textContent = 'Цена';
    btn.classList.remove('active');
  }
}

function selectSort(val, label) {
  document.getElementById('sortFilterLabel').textContent = label;
  const btn = document.getElementById('sortFilterBtn');
  btn.classList.toggle('active', val !== '');
  applySort(val);
  closeDropdowns();
}

function updateResetBtn() {
  const hasFilter = selectedSizes.length || selectedColors.length || selectedBrands.length || saleOnly ||
    document.getElementById('priceMin').value || document.getElementById('priceMax').value;
  document.getElementById('resetBtn').style.display = hasFilter ? 'inline-flex' : 'none';
}

function applySort(val) {
  let list = applyFiltersResult();
  if (val === 'price-asc')  list = [...list].sort((a,b) => a.price - b.price);
  if (val === 'price-desc') list = [...list].sort((a,b) => b.price - a.price);
  if (val === 'new')        list = list.filter(p => p.badge === 'Новинка').concat(list.filter(p => p.badge !== 'Новинка'));
  if (val === 'sale')       list = list.filter(p => p.oldPrice).concat(list.filter(p => !p.oldPrice));
  renderGrid(list);
}

function filterCat(cat) {
  activeCat = cat;
  activeSubcat = '';
  const titles = { women: 'Женщинам', men: 'Мужчинам', kids: 'Детям', sale: 'Распродажа', '': 'Все товары' };
  document.getElementById('catalogTitle').textContent = titles[cat] || 'Все товары';
  document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
  const tab = [...document.querySelectorAll('.ctab')].find(b => b.getAttribute('onclick').includes(`'${cat}'`));
  if (tab) tab.classList.add('active');
  applyFilters();
  document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
  return false;
}

function resetFilters() {
  activeCat = ''; activeSubcat = '';
  selectedSizes = []; selectedColors = []; selectedBrands = [];
  saleOnly = false;
  document.getElementById('priceMin').value = '';
  document.getElementById('priceMax').value = '';
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('saleToggle').classList.remove('active');
  document.getElementById('catFilterLabel').textContent   = 'Категория';
  document.getElementById('catFilterBtn').classList.remove('active');
  document.getElementById('sizeFilterLabel').textContent  = 'Размер';
  document.getElementById('sizeFilterBtn').classList.remove('active');
  document.getElementById('colorFilterLabel').textContent = 'Цвет';
  document.getElementById('colorFilterBtn').classList.remove('active');
  document.getElementById('brandFilterLabel').textContent = 'Бренд';
  document.getElementById('brandFilterBtn').classList.remove('active');
  document.getElementById('priceFilterLabel').textContent = 'Цена';
  document.getElementById('priceFilterBtn').classList.remove('active');
  document.getElementById('sortFilterLabel').textContent  = 'Сортировка';
  document.getElementById('sortFilterBtn').classList.remove('active');
  document.querySelectorAll('.ctab').forEach((b,i) => b.classList.toggle('active', i === 0));
  document.getElementById('catalogTitle').textContent = 'Все товары';
  document.getElementById('resetBtn').style.display = 'none';
  closeDropdowns();
  renderGrid(allProducts);
}

/* ===================== LOAD PRODUCTS ===================== */
let allProducts = [];

async function loadProducts() {
  try {
    const r = await fetch('products.json?t=' + Date.now());
    allProducts = await r.json();
    renderGrid(allProducts);
  } catch(e) {
    console.error(e);
  }
}

/* ===================== RENDER ===================== */
function renderGrid(list) {
  const grid  = document.getElementById('productsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('catalogCount');

  count.textContent = list.length ? `${list.length} товаров` : '';

  if (!list.length) {
    empty.style.display = '';
    grid.innerHTML = '';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = list.map(p => {
    const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const sizes = (p.sizes || []).map(s =>
      `<button class="product-card__size" onclick="quickAdd(event,'${esc(p.id)}','${esc(s)}')">${esc(s)}</button>`
    ).join('');
    return `
      <div class="product-card">
        <div class="product-card__img">
          ${p.image
            ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.style.display='none'" />`
            : `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
          }
          ${disc > 0 ? `<span class="product-card__badge product-card__badge--sale">−${disc}%</span>` : ''}
          ${p.badge && !disc ? `<span class="product-card__badge product-card__badge--new">${esc(p.badge)}</span>` : ''}
          <button class="product-card__wish" onclick="event.stopPropagation();showToast('Добавлено в избранное')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          ${sizes ? `<div class="product-card__sizes">${sizes}</div>` : ''}
        </div>
        <div class="product-card__body">
          ${p.brand ? `<div class="product-card__brand">${esc(p.brand)}</div>` : ''}
          <div class="product-card__name">${esc(p.name)}</div>
          <div class="product-card__prices">
            <span class="product-card__price">${fmt(p.price)}</span>
            ${p.oldPrice ? `<span class="product-card__old">${fmt(p.oldPrice)}</span>` : ''}
            ${disc > 0 ? `<span class="product-card__disc">−${disc}%</span>` : ''}
          </div>
        </div>
        <div class="product-card__foot">
          <button class="btn-add" onclick="addToCart('${esc(p.id)}')" ${!p.inStock ? 'disabled' : ''}>
            ${p.inStock ? 'В корзину' : 'Нет в наличии'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function quickAdd(e, id, size) {
  e.stopPropagation();
  addToCart(id, size);
}

/* ===================== CART ===================== */
let cart = JSON.parse(localStorage.getItem('em_cart') || '[]');

function addToCart(id, size) {
  const p = allProducts.find(p => p.id === id);
  if (!p) return;
  const key  = id + (size || '');
  const item = cart.find(c => c._key === key);
  if (item) { item.qty++; }
  else { cart.push({ ...p, qty: 1, selectedSize: size || null, _key: key }); }
  saveCart();
  showToast(`«${p.name}» добавлен в корзину`);
}

function changeQty(key, delta) {
  const item = cart.find(c => c._key === key);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  renderCart();
}

function removeItem(key) {
  cart = cart.filter(c => c._key !== key);
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem('em_cart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const body  = document.getElementById('cartBody');
  const count = document.getElementById('cartCount');
  const label = document.getElementById('cartQtyLabel');
  const total = cart.reduce((s, c) => s + c.qty, 0);
  const sum   = cart.reduce((s, c) => s + c.price * c.qty, 0);

  count.textContent = total || '';
  label.textContent = total ? `(${total})` : '';

  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      <p>Корзина пуста</p></div>`;
    return;
  }

  body.innerHTML = `
    <div class="cart-list">
      ${cart.map(c => `
        <div class="cart-item">
          <div class="cart-item__img">
            ${c.image ? `<img src="${esc(c.image)}" alt="" onerror="this.style.display='none'" />` : ''}
          </div>
          <div>
            ${c.brand ? `<div class="product-card__brand">${esc(c.brand)}</div>` : ''}
            <div class="cart-item__name">${esc(c.name)}</div>
            <div class="cart-item__meta">${c.selectedSize ? 'Размер: ' + esc(c.selectedSize) : ''}</div>
            <div class="cart-item__qty">
              <button onclick="changeQty('${esc(c._key)}', -1)">−</button>
              <span>${c.qty}</span>
              <button onclick="changeQty('${esc(c._key)}', 1)">+</button>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
            <button class="cart-item__del" onclick="removeItem('${esc(c._key)}')">✕</button>
            <div class="cart-item__price">${fmt(c.price * c.qty)}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="cart-footer">
      <div class="cart-total"><span>Итого:</span><strong>${fmt(sum)}</strong></div>
      <button class="btn btn--primary" style="width:100%;justify-content:center;height:48px" onclick="showToast('Оформление заказа скоро будет доступно!')">Оформить заказ</button>
    </div>
  `;
}

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
  document.body.style.overflow = document.getElementById('cartSidebar').classList.contains('open') ? 'hidden' : '';
}

/* ===================== TOAST ===================== */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ===================== HELPERS ===================== */
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmt(n) {
  return Number(n).toLocaleString('ru-RU') + ' ₸';
}

/* ===================== INIT ===================== */
loadProducts();
renderCart();
