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

test('o manequim avisa que dissolve ao clicar e responde ao teclado', () => {
  const [c] = tags('canvas', html.match(/<div class="palco3d">[\s\S]*?<\/div>/)[0]);
  assert.equal(c.id, 'manequim');
  assert.equal(c.tabindex, '0');
  assert.equal(c.role, 'button');
  assert.match(c['aria-label'], /dissolver/);
  assert.match(html, /<p class="dica">Arraste para girar · clique para dissolver<\/p>/);
});

test('rodapé com a mesa de moldes e o nome em relevo, ambos decorativos', () => {
  const rodape = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/)[1];
  const mesa = rodape.match(/<div class="mesa" aria-hidden="true">([\s\S]*?)<\/div>\s*<p class="relevo"/);
  assert.ok(mesa, 'mesa decorativa antes do relevo');
  assert.deepEqual([...mesa[1].matchAll(/data-molde="([a-z]+)"/g)].map(m => m[1]), ['frente', 'costas', 'manga', 'saia', 'gola']);
  assert.match(rodape, /<p class="relevo" aria-hidden="true">Michelle Fracaro<\/p>/);
  assert.match(rodape, /© 2026 Michelle Fracaro/);
});
