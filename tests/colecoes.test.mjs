import { test } from 'node:test';
import assert from 'node:assert/strict';
import { secao, tags, dialogo } from './pagina.mjs';

const TITULOS = ['Da Ausência à Presença', 'Rebel Noise', 'Conexões', 'Conexões', 'Conexões', 'Projeto ICESP',
                 'Ele me bebeu', 'Editorial Códigos', 'RevelarSP: Multiculturalidade', 'Anel Paralelo'];
const SLUGS = ['da-ausencia-a-presenca', 'rebel-noise', 'conexoes-3-semestre', 'conexoes-4-semestre',
               'conexoes-5-semestre', 'icesp', 'ele-me-bebeu', 'editorial', 'revelarsp', 'anel-paralelo'];
const POSTS = ['DZ6G2uDs5EC', 'DSTcjAMj4sw', 'C-TDYQsPifA', 'DCzD9RwuH1y', 'DLRDi6Guk3h', 'C-S3kVzu9cL',
               'C-S3_S5usYF', 'DHVnm1KRWLC', 'C-S0mEWOPK_', 'DDM352pu8ma'];
const ROTULOS = TITULOS.map((t, i) => SLUGS[i].startsWith('conexoes-') ? `${t}, ${SLUGS[i][9]}º semestre` : t);

test('dez projetos no varal, na ordem combinada', () => {
  const s = secao('colecoes');
  assert.deepEqual([...s.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)].map(m => m[1]), TITULOS);
  assert.equal(tags('img', s)[0].src, 'assets/img/tgi-da-ausencia-a-presenca.webp');
  assert.doesNotMatch(s, /class="foto f-/);
});

test('cada card abre o projeto na própria página', () => {
  const botoes = tags('button', secao('colecoes'));
  assert.deepEqual(botoes.map(b => b['data-projeto']), SLUGS);
  for (const b of botoes) assert.equal(b['aria-haspopup'], 'dialog');
  for (const slug of SLUGS) assert.ok(dialogo(`projeto-${slug}`));
});

test('cada projeto aberto tem título, mais fotos e o post certo', () => {
  const capas = tags('img', secao('colecoes')).map(a => a.src);
  SLUGS.forEach((slug, i) => {
    const d = dialogo(`projeto-${slug}`);
    assert.match(d, new RegExp(`<h2[^>]*>${TITULOS[i]}</h2>`));
    const fotos = tags('img', d).map(a => a.src);
    assert.ok(fotos.length >= 2, `${slug}: só ${fotos.length} foto`);
    assert.equal(fotos[0], capas[i]);
    const [link, ...resto] = tags('a', d);
    assert.equal(resto.length, 0);
    assert.equal(link.href, `https://www.instagram.com/p/${POSTS[i]}/`);
    assert.equal(link.target, '_blank');
    assert.match(link.rel, /noopener/);
    assert.equal(link['aria-label'], `${ROTULOS[i]}, abre o post no Instagram em nova aba`);
    assert.ok(tags('button', d).some(b => 'data-fecha' in b), `${slug}: sem botão de fechar`);
  });
});

test('as três Conexões dizem o semestre, e os créditos pedidos aparecem', () => {
  const metas = [...secao('colecoes').matchAll(/<p class="meta"><span>(.*?)<\/span>/g)].map(m => m[1]);
  assert.deepEqual(metas.slice(2, 5), ['Editorial do 3º semestre', 'Coleção do 4º semestre', 'Coleção do 5º semestre']);
  assert.match(dialogo('projeto-icesp'), /Amanda Ramalho e Luie Grotkowsky/);
  assert.match(dialogo('projeto-ele-me-bebeu'), /Fotografia: Rogério Affonso/);
  assert.match(dialogo('projeto-editorial'), /@amnddh e @_rafamartelli/);
  assert.match(dialogo('projeto-revelarsp'), /Fotos: Debby Gram/);
  assert.equal(tags('img', dialogo('projeto-icesp')).length, 2);
});

test('Rebel Noise abre com a foto das três modelos', () => {
  assert.equal(tags('img', secao('colecoes'))[1].src, 'assets/img/rebel-noise-4.webp');
});
