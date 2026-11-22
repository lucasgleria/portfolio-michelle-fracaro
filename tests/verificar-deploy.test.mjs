import { test } from 'node:test';
import assert from 'node:assert/strict';
import { html, tags } from './pagina.mjs';
import { verificar } from '../scripts/verificar-deploy.mjs';

const BASE = 'https://portfolio-michelle-fracaro-demo.vercel.app';
const TIPOS = { webp: 'image/webp', mp4: 'video/mp4', jpg: 'image/jpeg' };

// fetch falso: responde a partir de um mapa {caminho: resposta}; o que não está no mapa é 404
function falso(sobrescritas = {}) {
  const mapa = { '': { status: 200, type: 'text/html; charset=utf-8', body: html } };
  for (const s of [...tags('img'), ...tags('video')].flatMap(a => [a.src, a.poster]).filter(Boolean).concat('assets/img/og-michelle-fracaro.jpg'))
    mapa[s] = { status: 200, type: TIPOS[s.split('.').pop()], body: '' };
  Object.assign(mapa, sobrescritas);
  return async url => {
    const caminho = url.slice(BASE.length + 1);
    const r = mapa[caminho] ?? { status: 404, type: 'text/plain', body: 'not found' };
    return {
      status: r.status, ok: r.status >= 200 && r.status < 300,
      redirected: r.redirected ?? false, url: r.url ?? url,
      headers: { get: n => (n.toLowerCase() === 'content-type' ? r.type ?? null : null) },
      text: async () => r.body ?? '',
    };
  };
}

test('site correto não tem falhas', async () => assert.deepEqual(await verificar(BASE, falso()), []));

test('falha se uma mídia não existir', async () => {
  const f = await verificar(BASE, falso({ 'assets/img/rebel-noise.webp': { status: 404 } }));
  assert.ok(f.some(x => x.includes('assets/img/rebel-noise.webp')));
});

test('falha se a mídia vier com o tipo errado', async () => {
  const f = await verificar(BASE, falso({ 'assets/video/tgi-movimento.mp4': { status: 200, type: 'text/html', body: '' } }));
  assert.ok(f.some(x => x.includes('assets/video/tgi-movimento.mp4')));
});

test('falha se arquivo interno for servido', async () => {
  const f = await verificar(BASE, falso({ 'docs/conteudo-a-confirmar.md': { status: 200, type: 'text/markdown', body: '' } }));
  assert.ok(f.some(x => x.includes('docs/conteudo-a-confirmar.md')));
});

test('falha se redirecionar para login', async () => {
  const f = await verificar(BASE, falso({ '': { status: 200, type: 'text/html', body: '<html>', redirected: true, url: 'https://vercel.com/login' } }));
  assert.ok(f.length > 0);
});

test('falha se prévia sem noindex', async () => {
  const semNoindex = html.replace('<meta name="robots" content="noindex">', '');
  const f = await verificar(BASE, falso({ '': { status: 200, type: 'text/html', body: semNoindex } }));
  assert.ok(f.some(x => /noindex/.test(x)));
});

test('aceita a base com barra no final', async () => assert.deepEqual(await verificar(BASE + '/', falso()), []));

test('falha se a imagem de prévia do link não abrir', async () => {
  const f = await verificar(BASE, falso({ 'assets/img/og-michelle-fracaro.jpg': { status: 404 } }));
  assert.ok(f.some(x => x.includes('og-michelle-fracaro.jpg')));
});

test('falha se a prévia do link aponta para outro endereço', async () => {
  const f = await verificar('https://outro.vercel.app', async url => (await falso()(url.replace('https://outro.vercel.app', BASE))));
  assert.ok(f.some(x => /og:image/.test(x)));
  assert.ok(f.some(x => /og:url/.test(x)));
});
