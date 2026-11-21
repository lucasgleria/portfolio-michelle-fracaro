import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tags, existe, dimensoesWebp } from './pagina.mjs';

test('mídias copiadas existem', () => {
  for (const s of ['tgi-da-ausencia-a-presenca', 'rebel-noise', 'conexoes', 'icesp', 'figurino-ele-me-bebeu',
                   'revelarsp', 'editorial', 'anel-paralelo', 'autorretrato'])
    assert.ok(existe(`assets/img/${s}.webp`), s);
  assert.ok(existe('assets/video/tgi-movimento.mp4'));
  assert.ok(existe('assets/video/tgi-movimento.jpg'));
});

test('caminhos de mídia são ASCII minúsculo e existem', () => {
  const srcs = [...tags('img'), ...tags('video')].flatMap(a => [a.src, a.poster]).filter(Boolean);
  for (const s of srcs) {
    assert.match(s, /^assets\/(img|video)\/[a-z0-9-]+\.(webp|mp4|jpg)$/);
    assert.ok(existe(s), s);
  }
});

test('imagens têm alt, tamanho real e carregamento preguiçoso', () => {
  for (const a of tags('img')) {
    assert.ok(a.alt?.trim(), `alt vazio em ${a.src}`);
    const { w, h } = dimensoesWebp(a.src);
    assert.equal(Number(a.width), w, a.src);
    assert.equal(Number(a.height), h, a.src);
    assert.equal(a.loading, 'lazy');
    assert.equal(a.decoding, 'async');
  }
});
