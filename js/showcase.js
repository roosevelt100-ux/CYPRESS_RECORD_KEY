(() => {
  const selectedProductKey = 'greicin_selected_product';

  const previewFiles = (input) => {
    const card = input.closest('.showcase-card');
    const preview = card?.querySelector('.showcase-preview');
    if (!preview) return;

    preview.replaceChildren();
    Array.from(input.files || [])
      .filter((file) => file.type.startsWith('image/'))
      .forEach((file) => {
        const image = document.createElement('img');
        image.src = URL.createObjectURL(file);
        image.alt = `Prévia: ${file.name}`;
        image.addEventListener('load', () => URL.revokeObjectURL(image.src), { once: true });
        preview.append(image);
      });
  };

  const applySelectedProduct = () => {
    const form = document.querySelector('#quote-form');
    const productInput = form?.elements.namedItem('product');
    const selectedProduct = localStorage.getItem(selectedProductKey);
    if (productInput && selectedProduct) {
      productInput.value = selectedProduct;
      document.querySelector('#status').textContent = `${selectedProduct} selecionado para orçamento.`;
    }
  };

  document.querySelectorAll('.photo-trigger').forEach((button) => {
    button.addEventListener('click', () => document.getElementById(button.dataset.input)?.click());
  });

  document.querySelectorAll('.upload-input[type="file"]').forEach((input) => {
    input.addEventListener('change', () => previewFiles(input));
  });

  document.querySelectorAll('.select-product').forEach((button) => {
    button.addEventListener('click', () => {
      const product = button.dataset.product;
      localStorage.setItem(selectedProductKey, product);
      const quote = document.querySelector('#orcamento');
      if (quote) {
        applySelectedProduct();
        quote.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.assign('index.html#orcamento');
      }
    });
  });

  const form = document.querySelector('#quote-form');
  document.querySelector('#clear-quote')?.addEventListener('click', () => {
    form?.reset();
    applySelectedProduct();
    document.querySelector('#status').textContent = 'Campos limpos. A peça selecionada foi mantida.';
  });

  document.querySelector('#cancel-quote')?.addEventListener('click', () => {
    form?.reset();
    localStorage.removeItem(selectedProductKey);
    document.querySelector('#status').textContent = 'Orçamento cancelado.';
  });

  applySelectedProduct();
})();
