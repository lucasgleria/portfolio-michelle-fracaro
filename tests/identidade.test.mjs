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
  assert.match(s, /href="mailto:moraisfracaro@gmail\.com"/);
});

test('sem balé: ela é apresentada como designer de moda', () => {
  assert.doesNotMatch(html, /bailarin|balé|dança/i);
  assert.doesNotMatch(html, /Estilismo,|curso de Estilismo/);
  assert.match(secao('sobre'), /<p>Sou designer de moda,/);
  assert.match(secao('sobre'), /Clo3D/);
  assert.match(secao('sobre'), /Criação Têxtil/);
});

test('o manequim avisa que dissolve ao clicar e responde ao teclado', () => {
  const [c] = tags('canvas', html.match(/<div class="palco3d">[\s\S]*?<\/div>/)[0]);
  assert.equal(c.id, 'manequim');
  assert.equal(c.tabindex, '0');
  assert.equal(c.role, 'button');
  assert.match(c['aria-label'], /dissolver/);
  assert.match(html, /<p class="dica">Arraste para girar · clique para dissolver<\/p>/);
});

test('rodapé é uma gaveta entreaberta com o nome bordado no forro', () => {
  const rodape = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/)[1];
  const gaveta = rodape.match(/<div class="gaveta" aria-hidden="true">([\s\S]*?)<div class="rodape-linhas">/);
  assert.ok(gaveta, 'gaveta decorativa antes dos textos do rodapé');
  for (const p of ['fundo', 'parede tras', 'parede esq', 'parede dir']) assert.match(gaveta[1], new RegExp(`class="${p}"`));
  const bordado = gaveta[1].match(/<svg class="bordado"[\s\S]*?<\/svg>/);
  assert.ok(bordado, 'nome bordado em SVG');
  assert.ok([...bordado[0].matchAll(/>Michelle Fracaro<\/text>/g)].length >= 3, 'relevo e pesponto em camadas');
  assert.match(bordado[0], /class="nome pesponto"/);
  assert.doesNotMatch(rodape, /data-molde=/);
  assert.match(rodape, /© 2026 Michelle Fracaro/);
});
