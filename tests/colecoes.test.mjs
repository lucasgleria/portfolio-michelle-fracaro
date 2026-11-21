import { test } from 'node:test';
import assert from 'node:assert/strict';
import { secao, tags } from './pagina.mjs';

const TITULOS = ['Da Ausência à Presença', 'Rebel Noise', 'Conexões', 'Projeto ICESP', 'Ele me bebeu',
                 'Editorial', 'RevelarSP', 'Anel Paralelo'];

test('oito cards na ordem combinada', () => {
  const s = secao('colecoes');
  assert.deepEqual([...s.matchAll(/<h3>(.*?)<\/h3>/g)].map(m => m[1]), TITULOS);
  assert.match(s, /class="peca grande"[^>]*>\s*<div class="foto">\s*<img src="assets\/img\/tgi-da-ausencia-a-presenca\.webp"/);
  assert.doesNotMatch(s, /class="foto f-/);
});

test('cards abrem o post do Instagram em outra aba', () => {
  const links = tags('a', secao('colecoes'));
  assert.equal(links.length, 8);
  for (const a of links) {
    assert.match(a.href, /^https:\/\/www\.instagram\.com\/p\/[\w-]+\/$/);
    assert.equal(a.target, '_blank');
    assert.match(a.rel, /noopener/);
  }
});
