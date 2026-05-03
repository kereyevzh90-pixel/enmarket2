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
   FILTER BUTTONS
   ===================== */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
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
