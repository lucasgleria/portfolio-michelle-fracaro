import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { html, existe } from './pagina.mjs';

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

test('noindex existe se e somente se o selo de prévia existe', () => {
  assert.equal(/<meta name="robots" content="noindex">/.test(html), /class="previa"/.test(html));
  assert.match(html, /class="previa"/); // por enquanto ainda é prévia
});

test('descrição para buscadores e compartilhamento', () => {
  assert.match(html, /<meta name="description" content="Portfólio de moda de Michelle Fracaro, estilista formada pela Faculdade Santa Marcelina\.">/);
});

test('build roda os testes antes e publica só o site', () => {
  assert.equal(vercel.outputDirectory, 'public');
  assert.match(vercel.buildCommand, /^node --test "tests\/\*\.test\.mjs" && /);
  assert.equal(vercel.buildCommand.split(' && ').slice(1).join(' && '),
    'rm -rf public && mkdir public && cp -r index.html assets public/');
});

test('prévia do link (WhatsApp e redes) aponta para a imagem certa no endereço da demo', () => {
  const meta = p => html.match(new RegExp(`<meta property="${p}" content="([^"]*)">`))?.[1];
  const BASE = 'https://portfolio-michelle-fracaro-demo.vercel.app/';
  assert.equal(meta('og:url'), BASE);
  assert.equal(meta('og:title'), 'Michelle Fracaro — Portfólio de moda');
  assert.match(meta('og:description'), /Santa Marcelina/);
  assert.equal(meta('og:image'), BASE + 'assets/img/og-michelle-fracaro.jpg');
  assert.ok(existe('assets/img/og-michelle-fracaro.jpg'));
  assert.equal(meta('og:image:width'), '1200');
  assert.equal(meta('og:image:height'), '630');
});

test('a aba tem ícone, sem pedir favicon.ico ao servidor', () => {
  assert.match(html, /<link rel="icon" href="data:image\/svg\+xml,/);
});
