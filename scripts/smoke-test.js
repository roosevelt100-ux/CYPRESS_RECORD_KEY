const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('./js/main.js', 'utf8');
const localStorage = {
  store: {
    greicin_settings_v2: '{bad json',
  },
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
};

const form = {
  get(name) {
    const values = {
      name: 'Ana',
      company: 'ACME',
      email: 'ana@acme.com',
      quantity: '50',
      product: 'Kit Presidente',
      deadline: '2026-09-10',
      message: 'Gostaria de receber um orçamento para reunião.'
    };
    return values[name] ?? '';
  }
};

const formElement = {
  addEventListener(event, callback) {
    if (event === 'submit') {
      this.submit = callback;
    }
  }
};

const statusElement = { textContent: '' };

const sandbox = {
  window: {
    addEventListener() {},
    open() {},
    scrollY: 40,
  },
  document: {
    querySelector(selector) {
      if (selector === '#quote-form') {
        return formElement;
      }
      if (selector === '#header') {
        return { classList: { toggle() {} } };
      }
      if (selector === '.menu') {
        return { addEventListener() {} };
      }
      if (selector === '.header nav') {
        return { classList: { toggle() {}, remove() {} } };
      }
      if (selector === '#status') {
        return statusElement;
      }
      return null;
    },
    querySelectorAll() {
      return [];
    },
  },
  localStorage,
  FormData: class FormData {
    constructor(target) {
      this.target = target;
    }
    get(name) {
      return form.get(name);
    }
  },
  console,
};
sandbox.globalThis = sandbox;
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;

vm.runInNewContext(source, sandbox, { filename: 'js/main.js' });

assert.ok(sandbox.GreicinSite, 'GreicinSite should be exposed for tests');
assert.equal(typeof sandbox.GreicinSite.getStoredSettings(), 'object');
assert.equal(Object.keys(sandbox.GreicinSite.getStoredSettings()).length, 0);
assert.equal(sandbox.GreicinSite.getWhatsAppNumber({ whatsapp: '(11) 99999-9999' }), '11999999999');
assert.equal(
  sandbox.GreicinSite.buildWhatsAppMessage({
    name: 'Ana',
    company: 'ACME',
    email: 'ana@acme.com',
    quantity: '50',
    product: 'Kit Presidente',
    deadline: '2026-09-10',
    message: 'Gostaria de receber um orçamento para reunião.'
  }),
  'Olá! Sou Ana. Empresa: ACME. E-mail: ana@acme.com. Quantidade: 50. Brinde: Kit Presidente. Prazo: 2026-09-10. Projeto: Gostaria de receber um orçamento para reunião.'
);

formElement.submit({
  preventDefault() {},
  currentTarget: form,
});
assert.equal(statusElement.textContent, 'Abrindo o WhatsApp…');

console.log('Smoke test passed.');
