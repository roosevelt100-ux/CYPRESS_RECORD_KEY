const GreicinSite = {
  getStoredSettings() {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('greicin_settings_v2') : null;
    if (!raw) return {};

    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  },

  getWhatsAppNumber(settings = {}) {
    const normalized = (settings.whatsapp || '5511999999999').toString().replace(/\D/g, '');
    return normalized || '5511999999999';
  },

  buildWhatsAppMessage(values = {}) {
    const name = values.name || 'não informado';
    const company = values.company || 'não informado';
    const email = values.email || 'não informado';
    const quantity = values.quantity || 'a definir';
    const product = values.product || 'a definir';
    const deadline = values.deadline || 'a definir';
    const message = values.message || 'Gostaria de receber um orçamento.';

    return `Olá! Sou ${name}. Empresa: ${company}. E-mail: ${email}. Quantidade: ${quantity}. Brinde: ${product}. Prazo: ${deadline}. Projeto: ${message}`;
  },

  init() {
    const header = document.querySelector('#header');
    const menu = document.querySelector('.menu');
    const nav = document.querySelector('.header nav');

    if (header && typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 30);
      });
    }

    menu?.addEventListener('click', () => nav?.classList.toggle('open'));
    document.querySelectorAll('nav a').forEach((a) => {
      a.addEventListener('click', () => nav?.classList.remove('open'));
    });

    const settings = this.getStoredSettings();
    const number = this.getWhatsAppNumber(settings);
    const wa = (text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

    document.querySelector('#quote-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const text = this.buildWhatsAppMessage({
        name: form.get('name') || '',
        company: form.get('company') || '',
        email: form.get('email') || '',
        quantity: form.get('quantity') || '',
        product: form.get('product') || '',
        deadline: form.get('deadline') || '',
        message: form.get('message') || 'Gostaria de receber um orçamento.'
      });

      window.open(wa(text), '_blank');
      const status = document.querySelector('#status');
      if (status) status.textContent = 'Abrindo o WhatsApp…';
    });
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.GreicinSite = GreicinSite;
}

if (typeof window !== 'undefined') {
  window.GreicinSite = GreicinSite;
}

GreicinSite.init();
