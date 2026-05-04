/* =====================================================
   EnMarket Admin Panel
   Сохраняет товары в products.json через GitHub API
   Vercel автоматически деплоит при каждом коммите
   ===================================================== */

const REPO  = 'kereyevzh90-pixel/enmarket2';
const FILE  = 'products.json';
const BRANCH = 'main';

let products    = [];
let deleteTarget = null;

/* ===================== INIT ===================== */
window.addEventListener('DOMContentLoaded', () => {
  const token    = localStorage.getItem('em_token');
  const password = localStorage.getItem('em_password');

  if (!token || !password) {
    show('setupScreen');
  } else {
    show('loginScreen');
  }
});

/* ===================== SETUP ===================== */
function saveSetup() {
  const token    = document.getElementById('tokenInput').value.trim();
  const password = document.getElementById('passwordInput').value.trim();
  const err      = document.getElementById('setupError');

  if (!token) { err.textContent = 'Введите токен'; return; }
  if (!password) { err.textContent = 'Придумайте пароль'; return; }
  if (password.length < 4) { err.textContent = 'Пароль должен быть минимум 4 символа'; return; }

  localStorage.setItem('em_token', token);
  localStorage.setItem('em_password', btoa(unescape(encodeURIComponent(password))));
  err.textContent = '';
  enterAdmin();
}

function resetSetup() {
  localStorage.removeItem('em_token');
  localStorage.removeItem('em_password');
  show('setupScreen');
}

/* ===================== LOGIN ===================== */
function login() {
  const input    = document.getElementById('loginPassword').value;
  const stored   = decodeURIComponent(escape(atob(localStorage.getItem('em_password') || '')));
  const err      = document.getElementById('loginError');

  if (input === stored) {
    err.textContent = '';
    enterAdmin();
  } else {
    err.textContent = 'Неверный пароль';
    document.getElementById('loginPassword').value = '';
  }
}

function logout() {
  show('loginScreen');
  document.getElementById('loginPassword').value = '';
}

/* ===================== ENTER ADMIN ===================== */
async function enterAdmin() {
  show('adminScreen');
  showSection('products');
  initImageZone();
  await loadProducts();
}

/* ===================== SECTIONS ===================== */
function show(screenId) {
  ['setupScreen', 'loginScreen', 'adminScreen'].forEach(id => {
    document.getElementById(id).classList.toggle('hidden', id !== screenId);
  });
}

function showSection(name) {
  document.getElementById('sectionProducts').classList.toggle('hidden', name !== 'products');
  document.getElementById('sectionAdd').classList.toggle('hidden', name !== 'add');

  document.querySelectorAll('.sidebar__link').forEach((l, i) => {
    l.classList.toggle('active', (name === 'products' && i === 0) || (name === 'add' && i === 1));
  });

  if (name === 'add') {
    document.getElementById('formTitle').textContent = 'Добавить товар';
    document.getElementById('editId').value = '';
    resetForm();
  }
}

/* ===================== GITHUB API ===================== */
function token() { return localStorage.getItem('em_token'); }

async function ghGet(path) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`, {
    headers: { Authorization: `Bearer ${token()}`, Accept: 'application/vnd.github.v3+json' }
  });
  if (!r.ok) throw new Error(`GitHub error: ${r.status}`);
  return r.json();
}

async function ghPut(path, content, sha, message, rawBase64 = false) {
  const body = {
    message,
    content: rawBase64 ? content : btoa(unescape(encodeURIComponent(content))),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.message || `GitHub error: ${r.status}`);
  }
  return r.json();
}

/* ===================== LOAD PRODUCTS ===================== */
async function loadProducts() {
  try {
    const data  = await ghGet(FILE);
    const json  = decodeURIComponent(escape(atob(data.content)));
    products = JSON.parse(json);
    renderProducts();
    renderStats();
  } catch (e) {
    console.error(e);
    toast('Не удалось загрузить товары: ' + e.message, 'error');
  }
}

/* ===================== SAVE TO GITHUB ===================== */
async function saveToGitHub(message) {
  const data = await ghGet(FILE);
  const json = JSON.stringify(products, null, 2);
  await ghPut(FILE, json, data.sha, message);
}

/* ===================== RENDER PRODUCTS ===================== */
function renderProducts(list) {
  list = list || products;
  const el = document.getElementById('productsList');

  if (!list.length) {
    el.innerHTML = `<div class="empty-hint">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
      <p>Товаров пока нет. <button class="btn-link" onclick="showSection('add')">Добавить первый →</button></p>
    </div>`;
    return;
  }

  el.innerHTML = list.map(p => `
    <div class="product-row">
      <div class="product-row__img">
        ${p.image
          ? `<img src="${esc(p.image)}" alt="" onerror="this.style.display='none'" />`
          : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
        }
      </div>
      <div>
        <div class="product-row__name">${esc(p.name)}</div>
        <div class="product-row__cat">${esc(p.category || '—')}</div>
      </div>
      <div>
        <div class="product-row__price">${price(p.price)}</div>
        ${p.oldPrice ? `<div class="product-row__old">${price(p.oldPrice)}</div>` : ''}
      </div>
      <div>
        ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : '—'}
      </div>
      <div>
        <span class="badge ${p.inStock ? 'badge-success' : 'badge-muted'}">
          ${p.inStock ? 'В наличии' : 'Нет в наличии'}
        </span>
      </div>
      <div class="row-actions">
        <button onclick="editProduct('${p.id}')">Изменить</button>
        <button class="del" onclick="deleteProduct('${p.id}')">Удалить</button>
      </div>
    </div>
  `).join('');
}

function renderStats() {
  document.getElementById('statTotal').textContent   = products.length;
  document.getElementById('statInStock').textContent = products.filter(p => p.inStock).length;
  document.getElementById('statSale').textContent    = products.filter(p => p.oldPrice).length;
}

function filterProducts(q) {
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(q.toLowerCase())
  );
  renderProducts(filtered);
}

/* ===================== IMAGE UPLOAD ===================== */
let pendingImages = [];
let primaryImageId = null;

function initImageZone() {
  const zone  = document.getElementById('imgDropZone');
  const input = document.getElementById('imgFileInput');

  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    Array.from(input.files).forEach(handleImageFile);
    input.value = '';
  });
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).forEach(handleImageFile);
  });
}

function handleImageFile(file) {
  const id = uid();
  const localUrl = URL.createObjectURL(file);
  pendingImages.push({ id, url: null, localUrl, uploading: true, error: false });
  if (!primaryImageId) primaryImageId = id;
  renderImageGrid();

  uploadImageToGitHub(file).then(url => {
    const img = pendingImages.find(i => i.id === id);
    if (img) { img.url = url; img.uploading = false; URL.revokeObjectURL(img.localUrl); img.localUrl = null; }
    renderImageGrid();
  }).catch(() => {
    const img = pendingImages.find(i => i.id === id);
    if (img) { img.uploading = false; img.error = true; }
    renderImageGrid();
    toast('Ошибка загрузки изображения', 'error');
  });
}

async function uploadImageToGitHub(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = async e => {
      const base64 = e.target.result.split(',')[1];
      const ext    = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const fname  = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const path   = `images/products/${fname}`;
      try {
        await ghPut(path, base64, null, `Фото: ${fname}`, true);
        resolve(`https://raw.githubusercontent.com/${REPO}/main/${path}`);
      } catch (err) { reject(err); }
    };
    reader.readAsDataURL(file);
  });
}

function renderImageGrid() {
  const grid = document.getElementById('imgGrid');
  if (!pendingImages.length) { grid.innerHTML = ''; return; }
  grid.innerHTML = pendingImages.map(img => `
    <div class="img-thumb ${img.id === primaryImageId ? 'img-thumb--primary' : ''}">
      ${img.uploading
        ? `<div class="img-thumb__spinner"></div>`
        : img.error
          ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`
          : `<img src="${esc(img.localUrl || img.url)}" alt="" />`
      }
      ${!img.uploading ? `
        <button class="img-thumb__del" type="button" onclick="removeImage('${img.id}')">✕</button>
        <button class="img-thumb__star" type="button" onclick="setPrimaryImage('${img.id}')" title="Сделать основным">★</button>
      ` : ''}
    </div>
  `).join('');
}

function removeImage(id) {
  pendingImages = pendingImages.filter(i => i.id !== id);
  if (primaryImageId === id) primaryImageId = pendingImages[0]?.id || null;
  renderImageGrid();
}

function setPrimaryImage(id) {
  primaryImageId = id;
  const idx = pendingImages.findIndex(i => i.id === id);
  if (idx > 0) {
    const [item] = pendingImages.splice(idx, 1);
    pendingImages.unshift(item);
  }
  renderImageGrid();
}

function loadProductImages(p) {
  pendingImages = [];
  primaryImageId = null;
  const urls = p.images?.length ? p.images : (p.image ? [p.image] : []);
  urls.forEach((url, i) => {
    const id = uid();
    pendingImages.push({ id, url, localUrl: null, uploading: false, error: false });
    if (i === 0) primaryImageId = id;
  });
  renderImageGrid();
}

/* ===================== SAVE PRODUCT ===================== */
async function saveProduct(e) {
  e.preventDefault();

  const uploading = pendingImages.filter(i => i.uploading);
  if (uploading.length) { toast('Подождите, фото ещё загружаются...', 'error'); return; }

  const btn = document.getElementById('saveBtn');
  btn.disabled = true;
  btn.textContent = 'Публикуется...';

  const id     = document.getElementById('editId').value;
  const isEdit = !!id;

  const sizesRaw = document.getElementById('fSizes').value;
  const sizes = sizesRaw ? sizesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const readyImages = pendingImages.filter(i => !i.uploading && !i.error && (i.url || i.localUrl));
  const imageUrls   = readyImages.map(i => i.url || i.localUrl);
  const primaryUrl  = imageUrls[0] || '';

  const maxQtyVal = Number(document.getElementById('fMaxQty').value) || null;

  const product = {
    id:       id || uid(),
    name:     document.getElementById('fName').value.trim(),
    brand:    document.getElementById('fBrand').value.trim() || null,
    price:    Number(document.getElementById('fPrice').value),
    oldPrice: Number(document.getElementById('fOldPrice').value) || null,
    description: document.getElementById('fDesc').value.trim(),
    category: document.getElementById('fCategory').value,
    sizes,
    badge:    document.getElementById('fBadge').value || null,
    image:    primaryUrl,
    images:   imageUrls,
    maxQty:   maxQtyVal,
    inStock:  document.getElementById('fInStock').checked,
  };

  if (isEdit) {
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) products[idx] = product;
  } else {
    products.push(product);
  }

  try {
    await saveToGitHub(`${isEdit ? 'Обновлён' : 'Добавлен'} товар: ${product.name}`);
    toast(`Товар "${product.name}" опубликован! Сайт обновится за ~30 сек.`, 'success');
    resetForm();
    showSection('products');
    renderProducts();
    renderStats();
  } catch (err) {
    toast('Ошибка сохранения: ' + err.message, 'error');
    // откатить
    if (!isEdit) products.pop();
  }

  btn.disabled = false;
  btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Сохранить и опубликовать`;
}

/* ===================== EDIT ===================== */
function editProduct(id) {
  const p = products.find(p => p.id === id);
  if (!p) return;

  document.getElementById('editId').value          = p.id;
  document.getElementById('fName').value           = p.name;
  document.getElementById('fBrand').value          = p.brand || '';
  document.getElementById('fPrice').value          = p.price;
  document.getElementById('fOldPrice').value       = p.oldPrice || '';
  document.getElementById('fDesc').value           = p.description || '';
  document.getElementById('fCategory').value       = p.category || '';
  document.getElementById('fSizes').value          = (p.sizes || []).join(', ');
  document.getElementById('fBadge').value          = p.badge || '';
  document.getElementById('fMaxQty').value         = p.maxQty || '';
  document.getElementById('fInStock').checked      = p.inStock;
  document.getElementById('formTitle').textContent = 'Редактировать товар';

  loadProductImages(p);
  showSection('add');
  // чтобы nav не сломал active
  document.querySelectorAll('.sidebar__link')[1].classList.add('active');
  document.querySelectorAll('.sidebar__link')[0].classList.remove('active');
}

/* ===================== DELETE ===================== */
function deleteProduct(id) {
  deleteTarget = id;
  document.getElementById('deleteModal').classList.remove('hidden');
}

async function confirmDelete() {
  if (!deleteTarget) return;
  closeModal();

  const p = products.find(p => p.id === deleteTarget);
  products  = products.filter(p => p.id !== deleteTarget);
  deleteTarget = null;

  try {
    await saveToGitHub(`Удалён товар: ${p ? p.name : ''}`);
    toast('Товар удалён. Сайт обновится за ~30 сек.', 'success');
    renderProducts();
    renderStats();
  } catch (err) {
    toast('Ошибка удаления: ' + err.message, 'error');
    await loadProducts();
  }
}

function closeModal() {
  document.getElementById('deleteModal').classList.add('hidden');
}

/* ===================== FORM ===================== */
function resetForm() {
  document.getElementById('editId').value     = '';
  document.getElementById('fName').value      = '';
  document.getElementById('fBrand').value     = '';
  document.getElementById('fPrice').value     = '';
  document.getElementById('fOldPrice').value  = '';
  document.getElementById('fDesc').value      = '';
  document.getElementById('fCategory').value  = '';
  document.getElementById('fSizes').value     = '';
  document.getElementById('fBadge').value     = '';
  document.getElementById('fMaxQty').value    = '';
  document.getElementById('fInStock').checked = true;
  pendingImages  = [];
  primaryImageId = null;
  renderImageGrid();
}


/* ===================== TOAST ===================== */
function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  setTimeout(() => { el.className = 'toast'; }, 4000);
}

/* ===================== HELPERS ===================== */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function price(n) {
  return Number(n).toLocaleString('ru-RU') + ' ₽';
}
