import { test } from 'node:test';
import assert from 'node:assert/strict';
import { html, secao, tags } from './pagina.mjs';

test('Bastidores tem o vídeo novo da banca, sem tocar sozinho', () => {
  const s = secao('bastidores');
  const [v, ...resto] = tags('video', s);
  assert.equal(resto.length, 0);
  assert.equal(v.src, 'assets/video/tgi-banca.mp4');
  assert.equal(v.poster, 'assets/video/tgi-banca.jpg');
  for (const k of ['controls', 'muted', 'playsinline']) assert.ok(k in v, k);
  assert.ok(!('autoplay' in v));
  assert.equal(v.preload, 'metadata');
});

test('Bastidores mostra o processo do TCC na ordem que ela mandou', () => {
  const s = secao('bastidores');
  assert.deepEqual(tags('img', s).map(a => a.src),
    ['assets/img/bastidores-tgi-pesquisa.webp', 'assets/img/bastidores-tgi-superficies.webp',
     'assets/img/bastidores-tgi-prototipo.webp', 'assets/img/bastidores-tgi-desfile.webp']);
  assert.deepEqual([...s.matchAll(/<h3>(.*?)<\/h3>/g)].map(m => m[1]), ['Pesquisa', 'Superfícies', 'Protótipos', 'Desfile', 'Banca']);
  assert.match(s, /Extração cromática para definição da cartela de cores\./);
  assert.match(s, /Projeto bidimensional: croquis, cartela de cores e book\./);
});

test('Bastidores leva ao vídeo de processo de Conexões', () => {
  assert.match(secao('bastidores'), /href="https:\/\/youtu\.be\/TTBEE9axsPk"[^>]*target="_blank"[^>]*rel="noopener"/);
});

test('Conquistas com os marcos reais', () => {
  const s = secao('conquistas');
  assert.deepEqual([...s.matchAll(/<time datetime="(\d{4})">/g)].map(m => m[1]), ['2026', '2025', '2024', '2023', '2023']);
  assert.match(s, /12 melhores projetos/);
});

test('nenhuma textura provisória sobra, nem a seção sem vídeos de corpo', () => {
  assert.doesNotMatch(html, /class="foto f-/);
  assert.doesNotMatch(html, /data-legenda=/);
  assert.doesNotMatch(html, /id="movimento"/);
});

test('o mostrador navega pelas seções que existem', () => {
  const nav = html.match(/<nav class="mostrador"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(nav, 'mostrador não encontrado');
  const alvos = tags('a', nav[1]).map(a => a.href);
  assert.deepEqual(alvos, ['#sobre', '#colecoes', '#bastidores', '#conquistas', '#contato']);
  for (const a of alvos) assert.match(html, new RegExp(`id="${a.slice(1)}"`));
});
