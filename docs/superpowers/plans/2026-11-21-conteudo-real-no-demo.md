# Conteúdo real no demo — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar as texturas CSS e os textos provisórios do `index.html` pelas fotos, pelo vídeo, pelas coleções e pelas legendas reais do Instagram da Michelle, mantendo a página única e o manequim 3D.

**Architecture:** As mídias escolhidas são copiadas da exportação bruta (`instagram-michelle/posts/`) para `assets/img/` e `assets/video/`, com nomes curtos em ASCII. O `index.html` passa a usar `<img>`/`<video>` dentro dos mesmos blocos `.foto`, que já definem a proporção. Testes em `node:test` (sem dependências) leem o HTML como texto e conferem o conteúdo de cada seção e os arquivos referenciados.

**Tech Stack:** HTML/CSS/JS sem build, three.js r128 via cdnjs (já existente), Node 24 (`node --test`) só para os testes.

**Spec:** não há documento de spec. O escopo foi escolhido em 21/11/2026 ("Conteúdo real no demo", página única). As fontes são `C:\Users\lucas\vault\03-Projetos\Portfólio de moda — Michelle.md` (acordo, feedback, identidade visual) e `instagram-michelle/README.md` + as legendas `.txt` (conteúdo). Os textos abaixo foram tirados dessas legendas.

## Global Constraints

- Página única `index.html`. Nada de framework, bundler ou `package.json`. Os testes rodam com `node --test "tests/*.test.mjs"`.
- Paleta e tipografia não mudam (`:root` atual: `--palco #0F1E3A`, `--tule #A8C7E6`, Bodoni Moda + Jost).
- Nome público: **Michelle Fracaro**. Instagram: **@michelle_fracaro** (`https://www.instagram.com/michelle_fracaro/`). Formação: **Estilismo, Faculdade Santa Marcelina, 2026**.
- Caminhos de mídia: `assets/img/<slug>.webp` ou `assets/video/<slug>.(mp4|jpg)`, com o slug em `[a-z0-9-]` (a Vercel roda em Linux e diferencia maiúsculas).
- A exportação bruta (`instagram-michelle/`) e as referências (`inspirações/`) não vão para o git nem para o artifact.
- Continuam provisórios (de propósito): e-mail `contato@michelle.com`, medidas do manequim, seção Bastidores (sem fotos de processo na exportação). O selo "prévia" fica.
- Todo `<img>` precisa de `alt` descritivo, `width`/`height` com o tamanho real do arquivo, `loading="lazy"` e `decoding="async"`.
- Links externos: `target="_blank" rel="noopener"`.
- Commits terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Celular com conexão lenta:** 9 fotos de 100–300 KB. Elas devem carregar sob demanda e não podem fazer a página pular enquanto carregam. Os testes de `loading`/`decoding` e de `width`/`height` iguais ao arquivo ficam na Task 1.
2. **Hospedagem que diferencia maiúsculas e acentos:** um caminho com acento, espaço ou maiúscula funciona no Windows e quebra na Vercel. O teste de regex dos caminhos e de existência no disco fica na Task 1.
3. **Vídeo no iPhone:** o vídeo não pode tocar sozinho com som nem abrir em tela cheia por conta própria; ele precisa de capa enquanto não carrega. O teste de `controls muted playsinline preload="metadata" poster` fica na Task 4.
4. **Recorte das fotos:** retratos dentro de caixas 4/5 e 16/10 podem cortar cabeças. Quem olha deve ver rosto e peça inteiros. A conferência visual em 390 px e 1280 px fica na Task 3 (passo de verificação no navegador), com `object-position` ajustado por foto quando preciso.
5. **Links que levam para fora:** os cards abrem o post do Instagram. A aba do portfólio tem que continuar aberta e cada link tem que levar ao post certo. O teste de URL `https://www.instagram.com/p/<código>/` + `target`/`rel` fica na Task 3.

---

### Task 1: Base: git, mídias copiadas e testes de mídia

**Files:**
- Create: `.gitignore`, `assets/img/*.webp` (9), `assets/video/tgi-movimento.mp4`, `assets/video/tgi-movimento.jpg`
- Create: `tests/pagina.mjs` (helper), `tests/midias.test.mjs`
- Modify: `index.html:72-80` (CSS de `.foto`)

**Interfaces:**
- Produces (`tests/pagina.mjs`, usado por todos os testes seguintes):
  - `html: string`: conteúdo de `index.html` (lido da raiz do projeto, com caminho resolvido a partir de `import.meta.url`)
  - `secao(id: string): string`: trecho de `id="<id>"` até o próximo `</section>` ou `</header>`. Lança erro se o id não existir.
  - `tags(nome: string, trecho?: string): Array<Record<string,string>>`: atributos de cada `<nome ...>` no trecho (padrão: `html`). Atributo booleano (`muted`) vira `""`.
  - `existe(caminho: string): boolean`: relativo à raiz do projeto.
  - `dimensoesWebp(caminho: string): {w: number, h: number}`
- Produces (arquivos): os caminhos da tabela do Step 3.

- [ ] **Step 1: Iniciar o repositório**

```bash
cd /c/Users/lucas/portfolio-michelle && git init -b main
printf 'instagram-michelle/\ninspira*/\n' > .gitignore
```
Esperado: `git status` mostra só `.gitignore`, `CLAUDE.md`, `docs/` e `index.html`.

- [ ] **Step 2: Escrever o helper e o teste que falha**

`tests/pagina.mjs` com a interface acima. `dimensoesWebp` lê o cabeçalho RIFF:

```js
// VP8X: largura/altura-1 em 24 bits LE nos bytes 24–29; VP8 (lossy): 14 bits LE nos bytes 26–29
const b = readFileSync(abs);
const tipo = b.toString('ascii', 12, 16);
if (tipo === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
if (tipo === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
throw new Error(`WebP não suportado: ${caminho}`);
```

`tests/midias.test.mjs`:

```js
test('mídias copiadas existem', () => {
  for (const s of ['tgi-da-ausencia-a-presenca','rebel-noise','conexoes','icesp','figurino-ele-me-bebeu',
                   'revelarsp','editorial','anel-paralelo','autorretrato'])
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
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `node --test "tests/*.test.mjs"`
Esperado: FAIL em "mídias copiadas existem" (os outros passam no vazio por enquanto).

- [ ] **Step 4: Copiar as mídias**

De `instagram-michelle/posts/` (o arquivo é o que termina em `_<código>.<ext>`):

| Código do post | Destino |
|---|---|
| `DZ6G2uDs5EC` (.webp) | `assets/img/tgi-da-ausencia-a-presenca.webp` |
| `DSTcjAMj4sw` | `assets/img/rebel-noise.webp` |
| `DCzD9RwuH1y` | `assets/img/conexoes.webp` |
| `C-S3kVzu9cL` | `assets/img/icesp.webp` |
| `C-S3_S5usYF` | `assets/img/figurino-ele-me-bebeu.webp` |
| `C-S0qUmOYIH` | `assets/img/revelarsp.webp` |
| `DHVnm1KRWLC` | `assets/img/editorial.webp` |
| `DDM352pu8ma` | `assets/img/anel-paralelo.webp` |
| `C-S7tLZOrMe` | `assets/img/autorretrato.webp` |
| `DZ6GtMpsQmg` (.mp4 e .jpg) | `assets/video/tgi-movimento.mp4` / `.jpg` (640×1136) |

- [ ] **Step 5: CSS das mídias reais em `index.html`**

No bloco "Tecidos", acrescentar `.foto img,.foto video{width:100%;height:100%;object-fit:cover;display:block}` e trocar `.foto::after` por `.foto[data-legenda]::after` (assim o selo de legenda só aparece nos marcadores que sobrarem).

- [ ] **Step 6: Rodar e ver passar**

Run: `node --test "tests/*.test.mjs"`
Esperado: 3 testes PASS.

- [ ] **Step 7: Commit**

```bash
git add .gitignore assets tests index.html CLAUDE.md docs
git commit -m "chore: inicia repositório com mídias reais e testes de mídia"
```

---

### Task 2: Identidade, Sobre e Contato

**Files:**
- Modify: `index.html`: `<title>` (6), `#sobre` (192-208), `#contato` `.canais` (294-298), `footer` (318-321)
- Test: `tests/identidade.test.mjs`

**Interfaces:**
- Consumes: `html`, `secao`, `tags` de `tests/pagina.mjs`; `assets/img/autorretrato.webp`.

- [ ] **Step 1: Escrever o teste que falha**

```js
test('título e rodapé com o nome completo', () => {
  assert.match(html, /<title>Michelle Fracaro — Portfólio de moda<\/title>/);
  assert.match(html, /© 2026 Michelle Fracaro/);
});
test('Sobre usa o autorretrato e a formação real', () => {
  const s = secao('sobre');
  assert.deepEqual(tags('img', s).map(a => a.src), ['assets/img/autorretrato.webp']);
  assert.match(s, /Faculdade Santa Marcelina/);
  assert.doesNotMatch(s, /class="foto f-/);
});
test('Contato aponta para o Instagram real', () => {
  const s = secao('contato');
  assert.match(s, /href="https:\/\/www\.instagram\.com\/michelle_fracaro\/"/);
  assert.match(s, />@michelle_fracaro</);
  assert.match(s, />São Paulo</);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tests/identidade.test.mjs`. Esperado: 3 FAIL.

- [ ] **Step 3: Aplicar o conteúdo**

- `<title>Michelle Fracaro — Portfólio de moda</title>`. O `h1` "Michelle" e o subtítulo da abertura ficam como estão.
- Sobre: `.foto` sem classe de textura e sem `data-legenda`, com `<img src="assets/img/autorretrato.webp" alt="Autorretrato da Michelle" …>`. Textos:
  - P1: "Sou estilista formada pela Faculdade Santa Marcelina, em 2026, e bailarina. No palco aprendi como o tecido acompanha o corpo; no ateliê, transformo isso em roupa."
  - P2 (`.suave`): "Trabalho do croqui à peça pronta, muitas vezes também na fotografia e no styling. Já criei roupas de papel, jeans, joias em prata e uma coleção de graduação sobre o amor como cuidado."
  - `.fatos`: Formação → "Estilismo, Santa Marcelina, 2026"; Dança → "Balé"; Também faço → "Fotografia, styling e joalheria".
- Contato `.canais`: Instagram vira `<a href="https://www.instagram.com/michelle_fracaro/" target="_blank" rel="noopener">@michelle_fracaro</a>` dentro do `<span>`. O e-mail fica igual. A cidade vira "São Paulo".
- Footer: "© 2026 Michelle Fracaro · Design de moda" e "Prévia: alguns textos ainda provisórios · site por Lucas Leria".

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test "tests/*.test.mjs"`. Esperado: tudo PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html tests/identidade.test.mjs
git commit -m "feat: nome, Sobre e Contato com dados reais da Michelle"
```

---

### Task 3: Coleções com os 8 projetos reais

**Files:**
- Modify: `index.html`: `#colecoes` (210-247), parágrafo da `.cabeca` e `.colecoes`
- Test: `tests/colecoes.test.mjs`

**Interfaces:**
- Consumes: `secao`, `tags`, `html` de `tests/pagina.mjs`; os 8 webp de coleção da Task 1.

- [ ] **Step 1: Escrever o teste que falha**

```js
const TITULOS = ['Da Ausência à Presença','Rebel Noise','Conexões','Projeto ICESP','Ele me bebeu',
                 'Editorial','RevelarSP','Anel Paralelo'];
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tests/colecoes.test.mjs`. Esperado: 2 FAIL.

- [ ] **Step 3: Aplicar o conteúdo**

Parágrafo da `.cabeca`: "Projetos do curso de Estilismo e alguns extras, do primeiro croqui à foto final. Cada card abre o post original."

Cada card: `<a class="peca[ grande]" href="https://www.instagram.com/p/<código>/" target="_blank" rel="noopener">`, depois `.foto` com `<img>`, `.meta` (rótulo · ano), `h3` e `p`. Ordem: o card grande e o primeiro comum dividem a 1ª linha (8+4); depois vêm duas linhas de 3.

| # | h3 | Rótulo da `.meta` | Ano | Código | Imagem | alt | `p` |
|---|---|---|---|---|---|---|---|
| 1 (grande) | Da Ausência à Presença | Projeto de graduação | 2026 | `DZ6G2uDs5EC` | tgi-da-ausencia-a-presenca | Look da coleção Da Ausência à Presença | Moda como narrativa de reconexão humana: a falta de amor como ferida e o cuidado como a cicatriz que fica. |
| 2 | Rebel Noise | Coleção em jeans | 2025 | `DSTcjAMj4sw` | rebel-noise | Look em jeans da coleção Rebel Noise | O rock dos anos 70 e 80 em jeans, entre o peso do hard rock e o brilho do glam. |
| 3 | Conexões | Coleção · 4º semestre | 2024 | `DCzD9RwuH1y` | conexoes | Look da coleção Conexões | Pequenos detalhes que se enlaçam e se unem para criar formas. |
| 4 | Projeto ICESP | Moda e cuidado | 2024 | `C-S3kVzu9cL` | icesp | Roupa de papel com guizos do Projeto ICESP | Roupas de papel com guizos que lembram o sino tocado no fim da radioterapia. |
| 5 | Ele me bebeu | Projeto de figurino | 2024 | `C-S3_S5usYF` | figurino-ele-me-bebeu | Figurino inspirado no conto Ele me bebeu | Figurino baseado no conto de Clarice Lispector. |
| 6 | Editorial | Fotografia de moda | 2025 | `DHVnm1KRWLC` | editorial | Foto do editorial de moda | Fotografia, edição e styling feitos em grupo na disciplina de Fotografia de Moda. |
| 7 | RevelarSP | Roupa de papel | 2023 | `C-S0qUmOYIH` | revelarsp | Roupa de papel do projeto RevelarSP | As culturas do Bom Retiro em linhas e cores; entre os 12 melhores projetos do semestre. |
| 8 | Anel Paralelo | Joalheria | 2024 | `DDM352pu8ma` | anel-paralelo | Anel Paralelo em prata | Anel em prata feito por conta própria, fora do currículo. |

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test "tests/*.test.mjs"`. Esperado: tudo PASS.

- [ ] **Step 5: Conferir o recorte no navegador (Review Focus 4)**

Abrir `index.html` em 390 px e 1280 px de largura. Em cada card, o rosto e a peça devem aparecer inteiros. Onde a foto cortar, acrescentar `style="object-position:50% <n>%"` no `<img>` daquele card. Não mudar o `aspect-ratio` da grade.

- [ ] **Step 6: Commit**

```bash
git add index.html tests/colecoes.test.mjs
git commit -m "feat: coleções com os projetos reais do Instagram"
```

---

### Task 4: Em movimento, Bastidores e Conquistas

**Files:**
- Modify: `index.html`: CSS de `.video`/`.play` (106-113), `#movimento` (249-260), `#bastidores` (262-274), `#conquistas` (276-287)
- Test: `tests/movimento-conquistas.test.mjs`

**Interfaces:**
- Consumes: `secao`, `tags`, `html` de `tests/pagina.mjs`; `assets/video/tgi-movimento.{mp4,jpg}`.

- [ ] **Step 1: Escrever o teste que falha**

```js
test('Em movimento tem o vídeo real, sem tocar sozinho', () => {
  const s = secao('movimento');
  const [v, ...resto] = tags('video', s);
  assert.equal(resto.length, 0);
  assert.equal(v.src, 'assets/video/tgi-movimento.mp4');
  assert.equal(v.poster, 'assets/video/tgi-movimento.jpg');
  for (const k of ['controls','muted','playsinline']) assert.ok(k in v, k);
  assert.ok(!('autoplay' in v));
  assert.equal(v.preload, 'metadata');
  assert.doesNotMatch(s, /class="play"/);
});
test('Bastidores leva ao vídeo de processo de Conexões', () => {
  assert.match(secao('bastidores'), /href="https:\/\/youtu\.be\/TTBEE9axsPk"[^>]*target="_blank"[^>]*rel="noopener"/);
});
test('Conquistas com os marcos reais', () => {
  const s = secao('conquistas');
  assert.deepEqual([...s.matchAll(/<time datetime="(\d{4})">/g)].map(m => m[1]), ['2026','2024','2023']);
  assert.match(s, /12 melhores projetos/);
});
test('texturas só sobram em Bastidores', () => {
  const fora = html.replace(secao('bastidores'), '');
  assert.doesNotMatch(fora, /class="foto f-/);
  assert.doesNotMatch(fora, /data-legenda=/);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tests/movimento-conquistas.test.mjs`. Esperado: 4 FAIL.

- [ ] **Step 3: Aplicar o conteúdo**

- CSS: tirar a `animation:balanco` de `.video .foto`, os `nth-child` de atraso, `.play`, `.play::before` e o `@keyframes balanco`.
- `#movimento`: o parágrafo da `.cabeca` vira "As peças no corpo, em vídeo, começando pela coleção de graduação." O conteúdo passa a ser um único `.video` com `<div class="foto"><video src="assets/video/tgi-movimento.mp4" poster="assets/video/tgi-movimento.jpg" width="640" height="1136" controls muted playsinline preload="metadata" aria-label="Vídeo da coleção Da Ausência à Presença"></video></div><span>Da Ausência à Presença em movimento</span>`.
- `#bastidores`: as texturas ficam. Depois do `</ol>`, entra `<p style="margin-top:32px"><a href="https://youtu.be/TTBEE9axsPk" target="_blank" rel="noopener">Ver o processo da coleção Conexões no YouTube</a></p>`.
- `#conquistas` (3 itens):
  - 2026: "Projeto de graduação apresentado à banca", com o texto "Da Ausência à Presença, coleção de conclusão do curso de Estilismo na Santa Marcelina."
  - 2024: "Projeto ICESP", com o texto "Roupas de papel criadas para celebrar o fim do tratamento de pacientes com câncer."
  - 2023: "RevelarSP entre os destaques", com o texto "Selecionado entre os 12 melhores projetos do 1º semestre de 2023 da Santa Marcelina."

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test "tests/*.test.mjs"`. Esperado: tudo PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html tests/movimento-conquistas.test.mjs
git commit -m "feat: vídeo real, link de processo e conquistas reais"
```

---

### Task 5: Pendências para a Michelle e republicação

**Files:**
- Create: `docs/conteudo-a-confirmar.md`
- Modify: `CLAUDE.md` (linha "fotos são texturas CSS…")

- [ ] **Step 1: Escrever `docs/conteudo-a-confirmar.md`**

Uma linha por item, cada uma com o que foi assumido e onde aparece no site:
- anos de Figurino, ICESP e Anel tirados da data do post (as postagens de 05/08/2024 foram um lote de trabalhos anteriores);
- e-mail de contato;
- cidade "São Paulo";
- "bailarina" no Sobre (vem do vault, não do Instagram);
- fotos de processo para Bastidores;
- mais vídeos verticais para Em movimento;
- autorização para usar fotos com crédito de terceiros (Debby Gram, @fotograforogerioaffonso, @miaich_) e a forma de creditar.

- [ ] **Step 2: Atualizar `CLAUDE.md`**

Trocar a linha de provisórios por: "Fotos, vídeo e coleções vêm do Instagram (`assets/`, copiados de `instagram-michelle/`, fora do git); o que ainda falta confirmar com ela está em `docs/conteudo-a-confirmar.md`. Testes: `node --test \"tests/*.test.mjs\"`."

- [ ] **Step 3: Republicar o artifact**

Use a ferramenta Artifact com `url: https://claude.ai/artifact/C7keqcYSZNLQBM7RdYP57M` (leia antes com `action: "read"`), `file_path: index.html` e `files` com os 11 caminhos de `assets/` mapeados para eles mesmos.
Esperado: a página publicada mostra as fotos. Abra o link e confira que nenhuma imagem aparece quebrada.

- [ ] **Step 4: Rodar a suíte completa**

Run: `node --test "tests/*.test.mjs"`. Esperado: todos os testes PASS, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add docs/conteudo-a-confirmar.md CLAUDE.md
git commit -m "docs: pendências de conteúdo e instruções atualizadas"
```
