import { test } from 'node:test';
import assert from 'node:assert/strict';
import { secao, tags, dialogo } from './pagina.mjs';

const TITULOS = ['Da Ausência à Presença', 'Rebel Noise', 'Conexões', 'Conexões', 'Conexões', 'Projeto ICESP',
                 'Ele me bebeu', 'Editorial Códigos', 'RevelarSP', 'Anel Agulha', 'Anel Conexões', 'Anel Paralelo'];
const SLUGS = ['da-ausencia-a-presenca', 'rebel-noise', 'conexoes-3-semestre', 'conexoes-4-semestre',
               'conexoes-5-semestre', 'icesp', 'ele-me-bebeu', 'editorial', 'revelarsp', 'anel-agulha', 'anel-conexoes',
               'anel-paralelo'];
// o Anel Conexões (2024) leva ao reel do processo, como ela pediu
const POSTS = ['p/DZ6G2uDs5EC', 'p/DSTcjAMj4sw', 'p/C-TDYQsPifA', 'p/DCzD9RwuH1y', 'p/DLRDi6Guk3h', 'p/C-S3kVzu9cL',
               'p/C-S3_S5usYF', 'p/DHVnm1KRWLC', 'p/C-S0mEWOPK_', null, 'reel/DAWxDzBB_Sx', 'p/DDM352pu8ma'];
const ROTULOS = TITULOS.map((t, i) => SLUGS[i].startsWith('conexoes-') ? `${t}, ${SLUGS[i][9]}º semestre` : t);

test('doze projetos no varal, na ordem combinada', () => {
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
    if (!POSTS[i]) {
      // o anel de 2026 é só vídeo e não tem post único para linkar
      assert.deepEqual(tags('video', d).map(v => v.src), ['assets/video/anel-reel.mp4', 'assets/video/anel-processo.mp4']);
      assert.equal(tags('a', d).length, 0);
      assert.ok(tags('button', d).some(b => 'data-fecha' in b));
      return;
    }
    const fotos = tags('img', d).map(a => a.src);
    assert.ok(fotos.length >= 2, `${slug}: só ${fotos.length} foto`);
    assert.equal(fotos[0], capas[i]);
    const [link, ...resto] = tags('a', d);
    assert.equal(resto.length, 0);
    assert.equal(link.href, `https://www.instagram.com/${POSTS[i]}/`);
    assert.equal(link.target, '_blank');
    assert.match(link.rel, /noopener/);
    const oQue = POSTS[i].startsWith('reel/') ? 'o processo' : 'o post';
    assert.equal(link['aria-label'], `${ROTULOS[i]}, abre ${oQue} no Instagram em nova aba`);
    assert.ok(tags('button', d).some(b => 'data-fecha' in b), `${slug}: sem botão de fechar`);
  });
});

test('as três Conexões dizem o semestre, e os créditos pedidos aparecem', () => {
  const metas = [...secao('colecoes').matchAll(/<p class="meta"><span>(.*?)<\/span>/g)].map(m => m[1]);
  assert.deepEqual(metas.slice(2, 5), ['Editorial do 3º semestre', 'Coleção do 4º semestre', 'Coleção do 5º semestre']);
  assert.match(dialogo('projeto-icesp'), /Amanda Ramalho e Luie Grotkowsky/);
  assert.match(dialogo('projeto-ele-me-bebeu'), /Fotografia: Rogério Affonso/);
  assert.match(dialogo('projeto-editorial'), /Amanda Pereira e Rafaela Martelli/);
  assert.match(dialogo('projeto-revelarsp'), /Fotos: Debby Gram/);
  assert.equal(tags('img', dialogo('projeto-icesp')).length, 2);
});

test('capas e ordens de fotos pedidas por ela', () => {
  const capas = tags('img', secao('colecoes')).map(a => a.src);
  assert.equal(capas[1], 'assets/img/rebel-noise-4.webp');
  assert.deepEqual(tags('img', dialogo('projeto-conexoes-3-semestre')).map(a => a.src.slice(11)),
    ['conexoes-3-semestre-3.webp', 'conexoes-3-semestre-2.webp', 'conexoes-3-semestre.webp']);
  assert.deepEqual(tags('img', dialogo('projeto-conexoes-5-semestre')).map(a => a.src.slice(11)),
    ['conexoes-5-semestre-4.webp', 'conexoes-5-semestre-3.webp', 'conexoes-5-semestre.webp', 'conexoes-5-semestre-2.webp']);
});
