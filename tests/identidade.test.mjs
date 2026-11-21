import { test } from 'node:test';
import assert from 'node:assert/strict';
import { html, secao, tags } from './pagina.mjs';

test('título e rodapé com o nome completo', () => {
  assert.match(html, /<title>Michelle Fracaro — Portfólio de moda<\/title>/);
  assert.match(html, /© 2026 Michelle Fracaro/);
});

test('Sobre usa o autorretrato e a formação real', () => {
  const s = secao('sobre');
  assert.deepEqual(tags('img', s).map(a => a.src), ['assets/img/autorretrato.webp']);
  assert.match(s, /Faculdade Santa Marcelina/);
  assert.doesNotMatch(s, /class="foto f-/);
});

test('Contato aponta para o Instagram real', () => {
  const s = secao('contato');
  assert.match(s, /href="https:\/\/www\.instagram\.com\/michelle_fracaro\/"/);
  assert.match(s, />@michelle_fracaro</);
  assert.match(s, />São Paulo</);
});
