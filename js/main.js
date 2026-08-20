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
    const normalized = (settings.whatsapp || '5511954498352').toString().replace(/\D/g, '');
    return normalized || '5511954498352';
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

    menu?.addEventListener('click', () => {
      const isOpen = nav?.classList.toggle('open') || false;
      menu.classList.toggle('open', isOpen);
      menu.setAttribute('aria-expanded', String(isOpen));
      menu.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });
    document.querySelectorAll('nav a').forEach((a) => {
      a.addEventListener('click', () => {
        nav?.classList.remove('open');
        menu?.classList.remove('open');
        menu?.setAttribute('aria-expanded', 'false');
        menu?.setAttribute('aria-label', 'Abrir menu');
      });
    });

    const sectionLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
    const sections = sectionLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && sectionLinks.length) {
      const observer = new IntersectionObserver((entries) => {
        const visibleSection = entries.find((entry) => entry.isIntersecting);
        if (!visibleSection) return;
        sectionLinks.forEach((link) => {
          const isCurrent = link.getAttribute('href') === `#${visibleSection.target.id}`;
          link.toggleAttribute('aria-current', isCurrent);
          if (isCurrent) link.setAttribute('aria-current', 'page');
        });
      }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
      sections.forEach((section) => observer.observe(section));
    }

    const uploadButton = document.querySelector('#upload-photos');
    const photoFiles = document.querySelector('#photo-files');
    const uploadedGallery = document.querySelector('#uploaded-gallery');
    uploadButton?.addEventListener('click', () => photoFiles?.click());
    photoFiles?.addEventListener('change', () => {
      if (!uploadedGallery) return;
      uploadedGallery.innerHTML = '';
      Array.from(photoFiles.files || []).forEach((file) => {
        if (!file.type.startsWith('image/')) return;
        const figure = document.createElement('figure');
        const image = document.createElement('img');
        const caption = document.createElement('figcaption');
        image.src = URL.createObjectURL(file);
        image.alt = file.name;
        caption.textContent = file.name;
        figure.append(image, caption);
        uploadedGallery.appendChild(figure);
      });
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
