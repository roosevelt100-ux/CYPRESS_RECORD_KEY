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

// Validation rules for uploads
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateFile(file){
  if(!file) return { ok:false, reason: 'Nenhum arquivo.' };
  if(!ALLOWED_TYPES.includes(file.type)) return { ok:false, reason: 'Tipo de arquivo não suportado. Use JPG, PNG ou WEBP.' };
  if(file.size > MAX_FILE_SIZE) return { ok:false, reason: `Arquivo muito grande. Máx ${Math.round(MAX_FILE_SIZE/1024/1024)}MB.` };
  return { ok:true };
}

// Upload de fotos (Brindes)
const fileInput = document.querySelector('#photo-upload');
const uploadTrigger = document.querySelector('#upload-trigger');
const uploadSubmit = document.querySelector('#upload-submit');
const uploadPreview = document.querySelector('#upload-preview');
const uploadStatus = document.querySelector('#upload-status');
let selectedFiles = [];

uploadTrigger?.addEventListener('click', () => fileInput.click());

fileInput?.addEventListener('change', (e) => {
  const files = Array.from(e.target.files || []);
  selectedFiles = [];
  const errs = [];
  files.forEach(f => {
    const v = validateFile(f);
    if(v.ok) selectedFiles.push(f);
    else errs.push(`${f.name}: ${v.reason}`);
  });
  if(uploadStatus){
    if(errs.length) { uploadStatus.textContent = errs.join(' | '); uploadStatus.style.color = 'crimson'; }
    else { uploadStatus.textContent = ''; uploadStatus.style.color = ''; }
  }
  renderPreviews();
});

function renderPreviews(){
  if(!uploadPreview) return;
  uploadPreview.innerHTML = '';
  if(!selectedFiles.length){
    uploadPreview.innerHTML = '<p class="muted">Nenhuma imagem selecionada.</p>';
    return;
  }
  selectedFiles.forEach(file => {
    const url = URL.createObjectURL(file);
    const div = document.createElement('div');
    div.className = 'upload-thumb';
    div.innerHTML = `<img src="${url}" alt="${file.name}"><button class="thumb-remove" title="Remover">×</button><div class="thumb-info">${file.name}<small>${Math.round(file.size/1024)} KB</small></div>`;
    const btn = div.querySelector('.thumb-remove');
    btn.addEventListener('click', () => {
      selectedFiles = selectedFiles.filter(f => f !== file);
      renderPreviews();
    });
    uploadPreview.appendChild(div);
  });
}

uploadSubmit?.addEventListener('click', () => {
  if(!selectedFiles.length){
    uploadStatus.textContent = 'Selecione imagens antes de enviar.';
    uploadStatus.style.color = 'crimson';
    return;
  }
  uploadStatus.textContent = 'Enviando...';
  uploadStatus.style.color = '';
  // Simular upload (substitua por fetch para enviar a um endpoint real)
  setTimeout(() => {
    uploadStatus.textContent = `${selectedFiles.length} imagem(ns) enviadas (simulado).`;
    uploadStatus.style.color = 'green';
    selectedFiles = [];
    if(fileInput) fileInput.value = '';
    renderPreviews();
  }, 900);
});

// Per-product upload handlers
document.querySelectorAll('.product').forEach(product => {
  const input = product.querySelector('.product-photo-input');
  const selectBtn = product.querySelector('.upload-label button');
  const uploadBtn = product.querySelector('.product-upload-btn');
  const preview = product.querySelector('.product-preview');
  const status = product.querySelector('.upload-status');
  let selected = null;

  selectBtn?.addEventListener('click', () => input?.click());

  input?.addEventListener('change', (e) => {
    const f = e.target.files ? e.target.files[0] : null;
    const v = validateFile(f);
    if(!v.ok){
      if(status){ status.textContent = v.reason; status.style.color = 'crimson'; }
      // clear the input so user can reselect
      if(input) input.value = '';
      selected = null;
      renderProductPreview(preview, null, input, () => { selected = null; });
      return;
    }
    if(status){ status.textContent = ''; status.style.color = ''; }
    selected = f;
    renderProductPreview(preview, selected, input, () => { selected = null; });
  });

  uploadBtn?.addEventListener('click', () => {
    if(!selected){
      if(status) { status.textContent = 'Selecione uma imagem antes de enviar.'; status.style.color = 'crimson'; }
      return;
    }
    // disable button while uploading
    uploadBtn.disabled = true;
    if(status) { status.textContent = 'Enviando...'; status.style.color = ''; }
    // Escolher estratégia de upload: cloudinary | signed | simulated
    const metaStrategy = document.querySelector('meta[name="upload-strategy"]')?.getAttribute('content') || 'simulated';
    if(metaStrategy === 'cloudinary'){
      const cloudName = document.querySelector('meta[name="cloudinary-cloud-name"]')?.getAttribute('content');
      const uploadPreset = document.querySelector('meta[name="cloudinary-upload-preset"]')?.getAttribute('content');
      if(!cloudName || !uploadPreset){
        if(status){ status.textContent = 'Cloudinary não configurado (meta tags).'; status.style.color = 'crimson'; }
        return;
      }
      cloudinaryUpload(selected, cloudName, uploadPreset).then(result => {
        if(status){ status.textContent = 'Imagem enviada (Cloudinary).'; status.style.color = 'green'; }
        selected = null; if(input) input.value = ''; renderProductPreview(preview, null, input, () => {});
        uploadBtn.disabled = false;
      }).catch(err => {
        if(status){ status.textContent = 'Erro no upload Cloudinary.'; status.style.color = 'crimson'; }
        console.error(err);
        uploadBtn.disabled = false;
      });
    } else if(metaStrategy === 'signed'){
      // presigned S3 via Netlify Function
      signedUpload(selected).then(() => {
        if(status){ status.textContent = 'Imagem enviada (S3 presigned).'; status.style.color = 'green'; }
        selected = null; if(input) input.value = ''; renderProductPreview(preview, null, input, () => {});
        uploadBtn.disabled = false;
      }).catch(err => {
        if(status){ status.textContent = 'Erro no upload assinado.'; status.style.color = 'crimson'; }
        console.error(err);
        uploadBtn.disabled = false;
      });
    } else {
      // Simular upload por produto
      setTimeout(() => {
        if(status) { status.textContent = 'Imagem enviada (simulado).'; status.style.color = 'green'; }
        selected = null;
        if(input) input.value = '';
        renderProductPreview(preview, null, input, () => {});
        uploadBtn.disabled = false;
      }, 900);
    }
  });
});

function renderProductPreview(previewEl, file, inputEl, onRemove){
  if(!previewEl) return;
  previewEl.innerHTML = '';
  if(!file){
    previewEl.innerHTML = '<p class="muted">Nenhuma imagem selecionada.</p>';
    return;
  }
  const url = URL.createObjectURL(file);
  const div = document.createElement('div');
  div.className = 'upload-thumb';
  div.innerHTML = `<img src="${url}" alt="${file.name}"><button class="thumb-remove" title="Remover">×</button><div class="thumb-info">${file.name}<small>${Math.round(file.size/1024)} KB</small></div>`;
  const btn = div.querySelector('.thumb-remove');
  btn.addEventListener('click', () => {
    if(inputEl) inputEl.value = '';
    onRemove && onRemove();
    renderProductPreview(previewEl, null, inputEl, onRemove);
  });
  previewEl.appendChild(div);
}

/* Cloudinary upload helper (unsigned preset) */
async function cloudinaryUpload(file, cloudName, uploadPreset){
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', uploadPreset);
  const res = await fetch(url, { method: 'POST', body: fd });
  if(!res.ok) throw new Error('Cloudinary upload failed');
  return res.json();
}

/* Signed S3 upload helper (Netlify Function should return {url,key}) */
async function signedUpload(file){
  // request presigned URL from function
  const res = await fetch('/.netlify/functions/get-presigned', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ filename: file.name, contentType: file.type })
  });
  if(!res.ok) throw new Error('Failed to get presigned');
  const data = await res.json();
  // upload via PUT
  const put = await fetch(data.url, { method: 'PUT', headers: {'Content-Type': file.type}, body: file });
  if(!put.ok) throw new Error('Upload to S3 failed');
  return data; // contains key and possibly public URL
}

// Debug panel handlers (runtime, does not persist to disk)
document.addEventListener('DOMContentLoaded', () => {
  const dbgStrategy = document.getElementById('dbg-strategy');
  const dbgCloud = document.getElementById('dbg-cloud');
  const dbgPreset = document.getElementById('dbg-preset');
  const dbgApply = document.getElementById('dbg-apply');
  const dbgReset = document.getElementById('dbg-reset');
  const dbgStatus = document.getElementById('dbg-status');
  if(!dbgStrategy) return;

  // Initialize fields from meta tags if present
  const metaStrategy = document.querySelector('meta[name="upload-strategy"]');
  const metaCloud = document.querySelector('meta[name="cloudinary-cloud-name"]');
  const metaPreset = document.querySelector('meta[name="cloudinary-upload-preset"]');
  if(metaStrategy) dbgStrategy.value = metaStrategy.getAttribute('content') || 'simulated';
  if(metaCloud) dbgCloud.value = metaCloud.getAttribute('content') || '';
  if(metaPreset) dbgPreset.value = metaPreset.getAttribute('content') || '';

  dbgApply.addEventListener('click', () => {
    // set or update meta tags at runtime
    if(metaStrategy) metaStrategy.setAttribute('content', dbgStrategy.value);
    else {
      const m = document.createElement('meta'); m.name='upload-strategy'; m.content=dbgStrategy.value; document.head.appendChild(m);
    }
    if(metaCloud) metaCloud.setAttribute('content', dbgCloud.value);
    else { const m = document.createElement('meta'); m.name='cloudinary-cloud-name'; m.content=dbgCloud.value; document.head.appendChild(m); }
    if(metaPreset) metaPreset.setAttribute('content', dbgPreset.value);
    else { const m = document.createElement('meta'); m.name='cloudinary-upload-preset'; m.content=dbgPreset.value; document.head.appendChild(m); }
    dbgStatus.textContent = `Estratégia: ${dbgStrategy.value}`;
    dbgStatus.style.color = '#2e7d32';
  });

  dbgReset.addEventListener('click', () => {
    if(metaStrategy) metaStrategy.setAttribute('content','simulated');
    if(metaCloud) metaCloud.setAttribute('content','');
    if(metaPreset) metaPreset.setAttribute('content','');
    dbgStrategy.value = 'simulated'; dbgCloud.value=''; dbgPreset.value='';
    dbgStatus.textContent = 'Valores restaurados (simulado).'; dbgStatus.style.color='#666';
  });
});
