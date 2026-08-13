const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
});

toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});

document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
}));

const filters = document.querySelectorAll('.filter');
const products = document.querySelectorAll('.product');
filters.forEach(filter => {
  filter.addEventListener('click', () => {
    filters.forEach(f => f.classList.remove('active'));
    filter.classList.add('active');
    const category = filter.dataset.filter;
    products.forEach(product => {
      product.classList.toggle('hidden', category !== 'todos' && product.dataset.category !== category);
    });
  });
});

const modal = document.querySelector('#product-modal');
const modalTitle = document.querySelector('#modal-title');
const productInput = document.querySelector('#product');
const openModal = (product) => {
  modalTitle.textContent = product;
  productInput.value = product;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
};
const closeModal = () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
};
document.querySelectorAll('.product-btn').forEach(btn => btn.addEventListener('click', () => openModal(btn.dataset.product)));
document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
document.querySelector('#go-quote')?.addEventListener('click', () => {
  closeModal();
  document.querySelector('#orcamento').scrollIntoView({behavior:'smooth'});
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

document.querySelector('#quote-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const status = document.querySelector('#form-status');
  status.textContent = 'Mensagem preparada. Conecte este formulário ao seu Google Forms/CRM para envio real.';
  status.style.color = '#575551';
});
