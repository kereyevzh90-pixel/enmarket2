/* ===================== HEADER SCROLL ===================== */
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 10);
});

/* ===================== SEARCH ===================== */
function openSearch() {
  document.getElementById('searchOverlay').classList.add('open');
  setTimeout(() => document.getElementById('searchOverlayInput').focus(), 100);
}
function closeSearch(e) {
  if (!e || e.target === document.getElementById('searchOverlay')) {
    document.getElementById('searchOverlay').classList.remove('open');
    document.getElementById('searchOverlayInput').value = '';
    renderGrid(applyFiltersResult());
  }
}
function doSearch(q) {
  q = q.trim().toLowerCase();
  renderGrid(q ? allProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.category||'').toLowerCase().includes(q) ||
    (p.brand||'').toLowerCase().includes(q)
  ) : applyFiltersResult());
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); closeDrawer(); });

/* ===================== MENU DRAWER ===================== */
function openDrawer() {
  document.getElementById('menuDrawer').classList.add('open');
  document.getElementById('drawerOverlay').classList.add('open');
}
function closeDrawer() {
  document.getElementById('menuDrawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('open');
}
function setTabFromDrawer(val) {
  const tabs = document.querySelectorAll('.ctab');
  tabs.forEach(b => b.classList.remove('active'));
  const tab = [...tabs].find(b => b.getAttribute('onclick').includes(`'${val}'`));
  if (tab) tab.classList.add('active');
  activeCat = val;
  activeSubcat = '';
  renderGrid(applyFiltersResult());
  closeDrawer();
  document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}

/* ===================== BOTTOM FILTERS ===================== */
let bfilterOpen = false;
function toggleBfilter() {
  bfilterOpen = !bfilterOpen;
  document.getElementById('bfilterPanel').classList.toggle('open', bfilterOpen);
}
function closeBfilter() {
  bfilterOpen = false;
  document.getElementById('bfilterPanel').classList.remove('open');
}

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
  renderGrid(applyFiltersResult());
  document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
  return false;
}

/* ===================== TABS ===================== */
function setTab(btn, val) {
  document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
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
let activeCat = 'women';
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
    initFeatured(allProducts);
  } catch(e) {
    console.error(e);
  }
}

/* ===================== FEATURED CAROUSEL ===================== */
let featIndex = 0;
let featTotal = 0;
let featTimer = null;

function initFeatured(products) {
  const hits = products.filter(p => p.badge === 'Хит' && p.inStock !== false);
  const others = products.filter(p => p.badge !== 'Хит' && p.inStock !== false);
  const featured = [...hits, ...others].slice(0, 4);
  if (!featured.length) { document.getElementById('featured').style.display = 'none'; return; }

  featTotal = featured.length;
  const track = document.getElementById('featuredTrack');
  const dots  = document.getElementById('featuredDots');

  track.innerHTML = featured.map((p, i) => {
    const img = (p.images && p.images[0]) || p.image || '';
    const price = p.price ? p.price.toLocaleString('ru-RU') + ' ₸' : '';
    const old   = p.oldPrice ? p.oldPrice.toLocaleString('ru-RU') + ' ₸' : '';
    return `
      <div class="feat-slide" onclick="addToCart('${p.id}')">
        <img class="feat-slide__img" src="${img}" alt="${p.name}" />
        <div class="feat-slide__info">
          ${p.badge ? `<span class="feat-slide__badge">${p.badge}</span>` : ''}
          ${p.brand ? `<div class="feat-slide__brand">${p.brand}</div>` : ''}
          <div class="feat-slide__name">${p.name}</div>
          <div class="feat-slide__price">
            <span class="feat-slide__price-new">${price}</span>
            ${old ? `<span class="feat-slide__price-old">${old}</span>` : ''}
          </div>
          <button class="feat-slide__btn" onclick="event.stopPropagation();addToCart('${p.id}')">
            В корзину
          </button>
        </div>
      </div>`;
  }).join('');

  dots.innerHTML = featured.map((_, i) =>
    `<button class="feat-dot${i === 0 ? ' active' : ''}" onclick="featGoTo(${i})"></button>`
  ).join('');

  featStartTimer();
}

function featGoTo(idx) {
  featIndex = (idx + featTotal) % featTotal;
  document.getElementById('featuredTrack').style.transform = `translateX(-${featIndex * 100}%)`;
  document.querySelectorAll('.feat-dot').forEach((d, i) => d.classList.toggle('active', i === featIndex));
  featStartTimer();
}

function featSlide(dir) { featGoTo(featIndex + dir); }

function featStartTimer() {
  clearInterval(featTimer);
  featTimer = setInterval(() => featGoTo(featIndex + 1), 4000);
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
          <button class="product-card__wish ${isFav(p.id) ? 'active' : ''}" data-fav-id="${esc(p.id)}" onclick="event.stopPropagation();toggleFav('${esc(p.id)}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav(p.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="product-card__alert" data-alert-id="${esc(p.id)}" title="Уведомить о снижении цены" onclick="event.stopPropagation();toggleAlert('${esc(p.id)}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
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
  const max  = p.maxQty || Infinity;
  if (item) {
    if (item.qty >= max) { showToast(`Максимум ${max} шт. в одном заказе`); return; }
    item.qty++;
  } else {
    cart.push({ ...p, qty: 1, selectedSize: size || null, _key: key });
  }
  saveCart();
  showToast(`«${p.name}» добавлен в корзину`);
}

function changeQty(key, delta) {
  const item = cart.find(c => c._key === key);
  if (!item) return;
  const max = item.maxQty || Infinity;
  item.qty = Math.min(max, Math.max(1, item.qty + delta));
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
  if (typeof saveCartToSupabase === 'function') saveCartToSupabase();
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
          <button class="cart-item__del" onclick="removeItem('${esc(c._key)}')">✕</button>
          <div class="cart-item__img">
            ${c.image ? `<img src="${esc(c.image)}" alt="" onerror="this.style.display='none'" />` : ''}
          </div>
          <div class="cart-item__body">
            ${c.brand ? `<div class="product-card__brand">${esc(c.brand)}</div>` : ''}
            <div class="cart-item__name">${esc(c.name)}</div>
            <div class="cart-item__meta">${c.selectedSize ? 'Размер: ' + esc(c.selectedSize) : ''}</div>
            <div class="cart-item__bottom">
              <div class="cart-item__qty">
                <button onclick="changeQty('${esc(c._key)}', -1)">−</button>
                <span>${c.qty}</span>
                <button onclick="changeQty('${esc(c._key)}', 1)" ${c.maxQty && c.qty >= c.maxQty ? 'disabled title="Достигнут лимит"' : ''}>+</button>
              </div>
              <div class="cart-item__price">${fmt(c.price * c.qty)}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="cart-footer">
      <div class="cart-total"><span>Итого:</span><strong>${fmt(sum)}</strong></div>
      <button class="btn btn--primary" style="width:100%;justify-content:center;height:48px" onclick="placeOrder()">Оформить заказ</button>
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

/* ===================== SUPABASE SYNC ===================== */
let currentUser = null;
let userFavs = new Set(JSON.parse(localStorage.getItem('em_favs') || '[]'));

async function initSupabaseSync() {
  if (typeof _supa === 'undefined') return;
  const { data } = await _supa.auth.getUser();
  currentUser = data?.user || null;
  if (currentUser) {
    await loadFavsFromSupabase();
    await syncCartOnLogin();
    renderGrid(applyFiltersResult());
    renderFavsCount();
  }
}

/* ---- Favorites ---- */
async function loadFavsFromSupabase() {
  if (!currentUser) return;
  const { data } = await _supa.from('favorites').select('product_id').eq('user_id', currentUser.id);
  if (data) {
    userFavs = new Set(data.map(f => f.product_id));
    localStorage.setItem('em_favs', JSON.stringify([...userFavs]));
  }
}

function isFav(id) { return userFavs.has(String(id)); }

async function toggleFav(id) {
  id = String(id);
  if (!currentUser) { showToast('Войдите в аккаунт для сохранения'); openAuth('login'); return; }
  if (isFav(id)) {
    userFavs.delete(id);
    await _supa.from('favorites').delete().eq('user_id', currentUser.id).eq('product_id', id);
    showToast('Удалено из избранного');
  } else {
    userFavs.add(id);
    await _supa.from('favorites').insert({ user_id: currentUser.id, product_id: id });
    showToast('Добавлено в избранное');
  }
  localStorage.setItem('em_favs', JSON.stringify([...userFavs]));
  document.querySelectorAll(`[data-fav-id="${id}"]`).forEach(btn => btn.classList.toggle('active', isFav(id)));
  renderFavsCount();
  if (document.getElementById('favsSidebar').classList.contains('open')) renderFavsPanel();
}

function renderFavsCount() {
  const total = userFavs.size;
  document.getElementById('favsQtyLabel').textContent = total ? `(${total})` : '';
}

/* ---- Favs panel ---- */
function toggleFavsPanel() {
  const sidebar = document.getElementById('favsSidebar');
  const overlay = document.getElementById('favsOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
  document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
  if (sidebar.classList.contains('open')) renderFavsPanel();
}

function renderFavsPanel() {
  const body = document.getElementById('favsBody');
  const favProducts = allProducts.filter(p => isFav(p.id));
  if (!favProducts.length) {
    body.innerHTML = '<div class="cart-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><p>Избранное пусто</p></div>';
    return;
  }
  body.innerHTML = `<div class="cart-list">${favProducts.map(p => `
    <div class="cart-item">
      <button class="cart-item__del" onclick="toggleFav('${esc(p.id)}')">✕</button>
      <div class="cart-item__img">${p.image ? `<img src="${esc(p.image)}" alt="" onerror="this.style.display='none'" />` : ''}</div>
      <div class="cart-item__body">
        ${p.brand ? `<div class="product-card__brand">${esc(p.brand)}</div>` : ''}
        <div class="cart-item__name">${esc(p.name)}</div>
        <div class="cart-item__price">${fmt(p.price)}</div>
        <button class="btn-add" style="margin-top:8px;font-size:13px;height:36px" onclick="addToCart('${esc(p.id)}')">В корзину</button>
      </div>
    </div>`).join('')}</div>`;
}

/* ---- Cart sync ---- */
async function syncCartOnLogin() {
  if (!currentUser) return;
  const { data } = await _supa.from('cart').select('items').eq('user_id', currentUser.id).maybeSingle();
  const serverItems = data?.items || [];
  const merged = [...cart];
  serverItems.forEach(si => { if (!merged.find(li => li._key === si._key)) merged.push(si); });
  cart = merged;
  saveCart();
}

async function saveCartToSupabase() {
  if (!currentUser) return;
  await _supa.from('cart').upsert({ user_id: currentUser.id, items: cart, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
}

/* ---- Orders ---- */
async function placeOrder() {
  if (!currentUser) { showToast('Войдите для оформления заказа'); toggleCart(); openAuth('login'); return; }
  if (!cart.length) return;
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const items = cart.map(c => ({ id: c.id, name: c.name, price: c.price, qty: c.qty, size: c.selectedSize || null, image: c.image || null }));
  const { error } = await _supa.from('orders').insert({ user_id: currentUser.id, items, total, status: 'new' });
  if (error) { showToast('Ошибка оформления'); return; }
  cart = [];
  saveCart();
  saveCartToSupabase();
  toggleCart();
  showToast('Заказ оформлен! Мы свяжемся с вами.');
}

async function showOrders() {
  if (!currentUser) { openAuth('login'); return; }
  document.getElementById('ordersOverlay').classList.add('open');
  document.getElementById('ordersBody').innerHTML = '<p style="color:var(--muted);text-align:center;padding:24px">Загрузка...</p>';
  const { data: orders } = await _supa.from('orders').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
  const body = document.getElementById('ordersBody');
  if (!orders?.length) { body.innerHTML = '<p class="orders-empty">У вас ещё нет заказов</p>'; return; }
  const statusMap = { new: 'Новый', processing: 'В обработке', shipped: 'Отправлен', delivered: 'Доставлен' };
  body.innerHTML = orders.map(o => `
    <div class="order-card">
      <div class="order-card__head">
        <span class="order-id">#${o.id.slice(-6).toUpperCase()}</span>
        <span class="order-status order-status--${o.status}">${statusMap[o.status] || o.status}</span>
        <span class="order-date">${new Date(o.created_at).toLocaleDateString('ru-RU')}</span>
      </div>
      <div class="order-items">${(o.items||[]).map(i => `${i.name} × ${i.qty}`).join(', ')}</div>
      <div class="order-total">${fmt(o.total)}</div>
    </div>`).join('');
}

function closeOrders(e) {
  if (e && e.target !== document.getElementById('ordersOverlay')) return;
  document.getElementById('ordersOverlay').classList.remove('open');
}

/* ---- Price alerts ---- */
async function toggleAlert(id) {
  if (!currentUser) { showToast('Войдите для получения уведомлений'); openAuth('login'); return; }
  const { data } = await _supa.from('price_alerts').select('id').eq('user_id', currentUser.id).eq('product_id', id).maybeSingle();
  if (data) {
    await _supa.from('price_alerts').delete().eq('id', data.id);
    showToast('Уведомление отменено');
    document.querySelectorAll(`[data-alert-id="${id}"]`).forEach(btn => btn.classList.remove('active'));
  } else {
    const p = allProducts.find(p => p.id == id);
    await _supa.from('price_alerts').insert({ user_id: currentUser.id, product_id: String(id), target_price: p?.price || 0 });
    showToast('Уведомим когда цена снизится!');
    document.querySelectorAll(`[data-alert-id="${id}"]`).forEach(btn => btn.classList.add('active'));
  }
}

initSupabaseSync();
