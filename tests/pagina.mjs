// Leitura do index.html como texto para os testes de conteúdo
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

export const html = readFileSync(join(raiz, 'index.html'), 'utf8');

export function secao(id) {
  const inicio = html.indexOf(`id="${id}"`);
  if (inicio < 0) throw new Error(`Seção não encontrada: ${id}`);
  const fim = html.slice(inicio).search(/<\/(section|header)>/);
  return html.slice(inicio, inicio + fim);
}

export function tags(nome, trecho = html) {
  return [...trecho.matchAll(new RegExp(`<${nome}\\b([^>]*)>`, 'g'))].map(m => {
    const attrs = {};
    for (const a of m[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] ?? '';
    return attrs;
  });
}

export function existe(caminho) {
  return existsSync(join(raiz, caminho));
}

export function dimensoesWebp(caminho) {
  // VP8X: largura/altura-1 em 24 bits LE nos bytes 24–29; VP8 (lossy): 14 bits LE nos bytes 26–29
  const b = readFileSync(join(raiz, caminho));
  const tipo = b.toString('ascii', 12, 16);
  if (tipo === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (tipo === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  throw new Error(`WebP não suportado: ${caminho}`);
}

export function dimensoesMp4(caminho) {
  // caixa tkhd da trilha de vídeo: largura e altura em ponto fixo 16.16 nos últimos 8 bytes
  const b = readFileSync(join(raiz, caminho));
  const inicio = b.lastIndexOf('tkhd') - 4;
  const fim = inicio + b.readUInt32BE(inicio);
  return { w: b.readUInt32BE(fim - 8) >>> 16, h: b.readUInt32BE(fim - 4) >>> 16 };
}
