import { test } from 'node:test';
import assert from 'node:assert/strict';
import { html, secao, tags } from './pagina.mjs';

test('Em movimento tem o vídeo real, sem tocar sozinho', () => {
  const s = secao('movimento');
  const [v, ...resto] = tags('video', s);
  assert.equal(resto.length, 0);
  assert.equal(v.src, 'assets/video/tgi-movimento.mp4');
  assert.equal(v.poster, 'assets/video/tgi-movimento.jpg');
  for (const k of ['controls', 'muted', 'playsinline']) assert.ok(k in v, k);
  assert.ok(!('autoplay' in v));
  assert.equal(v.preload, 'metadata');
  assert.doesNotMatch(s, /class="play"/);
});

test('Bastidores leva ao vídeo de processo de Conexões', () => {
  assert.match(secao('bastidores'), /href="https:\/\/youtu\.be\/TTBEE9axsPk"[^>]*target="_blank"[^>]*rel="noopener"/);
});

test('Conquistas com os marcos reais', () => {
  const s = secao('conquistas');
  assert.deepEqual([...s.matchAll(/<time datetime="(\d{4})">/g)].map(m => m[1]), ['2026', '2024', '2023']);
  assert.match(s, /12 melhores projetos/);
});

test('texturas só sobram em Bastidores', () => {
  const fora = html.replace(secao('bastidores'), '');
  assert.doesNotMatch(fora, /class="foto f-/);
  assert.doesNotMatch(fora, /data-legenda=/);
});
