// Confere um endereço publicado: página aberta sem login, prévia com noindex, mídias no ar e arquivos internos fora.
// Uso: node scripts/verificar-deploy.mjs https://portfolio-michelle-fracaro.vercel.app
import { pathToFileURL } from 'node:url';

const TIPOS = { webp: 'image/webp', mp4: 'video/mp4', jpg: 'image/jpeg' };
const INTERNOS = ['docs/conteudo-a-confirmar.md', 'CLAUDE.md', 'tests/pagina.mjs', 'README.md', 'vercel.json'];

export async function verificar(base, buscar = fetch) {
  base = base.replace(/\/+$/, '');
  const falhas = [];
  const pedir = async caminho => {
    try { return await buscar(`${base}/${caminho}`); }
    catch (e) { falhas.push(`${caminho || '/'}: erro de rede (${e.message})`); return null; }
  };

  const pagina = await pedir('');
  if (!pagina) return falhas;
  if (pagina.status !== 200) falhas.push(`/: status ${pagina.status}, esperado 200`);
  if (pagina.redirected || new URL(pagina.url).host !== new URL(base).host)
    falhas.push(`/: redirecionou para ${pagina.url} (pede login?)`);
  const html = await pagina.text();
  if (!/<title>Michelle Fracaro/.test(html)) falhas.push('/: título "Michelle Fracaro" não encontrado');
  const previa = /class="previa"/.test(html);
  const noindex = /<meta name="robots" content="noindex">/.test(html);
  if (previa !== noindex)
    falhas.push(previa ? '/: prévia sem meta noindex' : '/: meta noindex na versão final');

  const midias = new Set([...html.matchAll(/\b(?:src|poster)="(assets\/[^"]+)"/g)].map(m => m[1]));
  for (const m of midias) {
    const r = await pedir(m);
    if (!r) continue;
    const tipo = r.headers.get('content-type') ?? '';
    if (r.status !== 200) falhas.push(`${m}: status ${r.status}, esperado 200`);
    else if (!tipo.startsWith(TIPOS[m.split('.').pop()])) falhas.push(`${m}: content-type "${tipo}"`);
  }

  for (const c of INTERNOS) {
    const r = await pedir(c);
    if (r && r.status !== 404) falhas.push(`${c}: status ${r.status}, esperado 404 (arquivo interno exposto)`);
  }
  return falhas;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const base = process.argv[2];
  if (!base) { console.error('Uso: node scripts/verificar-deploy.mjs <url>'); process.exit(2); }
  const falhas = await verificar(base);
  for (const f of falhas) console.log(`✖ ${f}`);
  console.log(falhas.length === 1 ? '1 falha' : `${falhas.length} falhas`);
  process.exit(falhas.length ? 1 : 0);
}
