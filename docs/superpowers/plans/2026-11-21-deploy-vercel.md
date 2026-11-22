# Deploy na Vercel — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar o portfólio numa demo pública para a Michelle aprovar e, depois da aprovação, entregar o site na conta Vercel dela, com deploy automático a cada push.

**Architecture:** O repositório vai para o GitHub do Lucas (público). A Vercel usa um `vercel.json` cujo build roda os testes e copia **só** `index.html` e `assets/` para `public/`. Assim, um push que quebra os testes não substitui a versão no ar, e os arquivos internos (docs, testes, CLAUDE.md) nunca são servidos. Um script `scripts/verificar-deploy.mjs` confere qualquer URL publicada. Depois da aprovação, o repositório é transferido para o GitHub dela, porque a Vercel só importa repositório pessoal se quem importa for o dono.

**Tech Stack:** HTML estático (sem framework), Vercel (preset "Other", plano Hobby), GitHub + `gh` CLI, Node 24 local e Node ≥ 22 no build da Vercel (`node --test`, `fetch`).

**Spec:** não há documento. As decisões foram tomadas com o Lucas em 21/11/2026:
- a demo fica na conta Vercel do Lucas e o site final na dela, só depois da aprovação;
- o repositório fica no GitHub do Lucas, público, e é transferido para ela na entrega;
- `noindex` enquanto o site for prévia;
- o endereço final é `portfolio-michelle-fracaro`.

O acordo está no vault **lux** (`C:\Users\lucas\vault-template - Copia\lux\03-Projetos\Portfólio de moda — Michelle.md`, repositório `lucasgleria/lux`, branch `main`). Toda atualização de vault deste plano vai para o lux: ler `AGENTS.md`, configuração, autonomia e continuidade do lux antes, comparar a versão, integrar na `main` e reler depois. A pasta `C:\Users\lucas\vault` e o repositório `lucasgleria/vault` são só leitura. A regra de dono do repositório está em https://vercel.com/docs/git/vercel-for-github ("you must be the repository Owner").

## Global Constraints

- Endereço da demo: `https://portfolio-michelle-fracaro-demo.vercel.app` (conta do Lucas). Endereço final: `https://portfolio-michelle-fracaro.vercel.app` (conta dela). Os nomes `.vercel.app` são globais, então a demo **nunca** usa o nome final.
- Repositório: `lucasgleria/portfolio-michelle-fracaro`, público, branch `main`.
- Servidos na web: apenas `index.html` e `assets/**`.
- `<meta name="robots" content="noindex">` existe **se e somente se** o selo `class="previa"` existe.
- Sem `package.json` e sem dependências. Testes: `node --test "tests/*.test.mjs"`.
- Passos que publicam ou mexem em conta de terceiros (criar o repo público, mandar o link para a Michelle, transferir o repo) só acontecem com o Lucas confirmando no momento.
- Commits terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Link que pede login:** a URL própria de cada deploy (`…-<hash>-lucasglerias-projects.vercel.app`) fica atrás do login da Vercel. A Michelle precisa abrir o link sem login. O script confere que o endereço responde 200 sem redirecionar para `vercel.com` (Task 2, teste `falha se redirecionar para login`).
2. **Push quebrado do irmão:** uma edição que quebra os testes não pode tirar o site do ar. O build falha e a versão anterior continua publicada. O teste de que `buildCommand` começa com `node --test` e só copia depois de `&&` fica na Task 1.
3. **Demo no Google:** a prévia, com e-mail provisório e textos ainda não confirmados, não deve aparecer em buscas. Há um teste local do par selo/noindex (Task 1) e outro no HTML publicado (Task 2).
4. **Arquivos internos expostos:** `docs/conteudo-a-confirmar.md`, `CLAUDE.md` e `tests/` não devem abrir no site. O build só copia o que é site (Task 1), e o script exige 404 nesses caminhos (Task 2).
5. **Link antigo morto na entrega:** se a Michelle salvou o link da demo, ele deve continuar funcionando até o site final estar verificado e o link novo ter sido enviado. O passo de apagar a demo vem por último na Task 6, depois da verificação.

---

### Task 1: Build da Vercel, noindex e README

**Files:**
- Create: `vercel.json`, `README.md`, `tests/publicacao.test.mjs`
- Modify: `index.html` (`<head>`, linhas 4-6), `.gitignore`

**Interfaces:**
- Consumes: `html` de `tests/pagina.mjs`.
- Produces: `vercel.json` com `buildCommand`/`outputDirectory`, que a Task 4 e a Task 6 usam sem configurar nada no painel.

- [ ] **Step 1: Escrever o teste que falha**

```js
import { readFileSync } from 'node:fs';
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tests/publicacao.test.mjs`. Esperado: FAIL (falta `vercel.json`).

- [ ] **Step 3: Implementar**

- `vercel.json`: `{"buildCommand": "<igual ao teste>", "outputDirectory": "public"}`.
- `.gitignore`: acrescentar `public/` e `.vercel/`.
- `index.html`: depois do `viewport`, as duas metas do teste (robots e description).
- `README.md` (pt-BR, curto):
  - o que é;
  - como rodar os testes;
  - como publicar ("push na `main` → a Vercel roda os testes e publica; se um teste falhar, nada muda no ar");
  - "Fotos, vídeo e textos © Michelle Fracaro e fotógrafos creditados no Instagram; não reutilizar. Código e 3D por Lucas Leria.";
  - "Sem licença: todo o conteúdo é reservado." (não criar arquivo LICENSE);
  - o link da demo, preenchido na Task 4.

- [ ] **Step 4: Rodar os testes e simular o build**

Run: `node --test "tests/*.test.mjs"` → tudo PASS.
Run (Git Bash): `bash -c "$(node -p "require('./vercel.json').buildCommand")" && find public -type f | sort` → os testes passam e a lista mostra só `public/index.html` e os 11 arquivos de `public/assets/`. Depois, `rm -rf public`.

- [ ] **Step 5: Commit**

```bash
git add vercel.json README.md .gitignore index.html tests/publicacao.test.mjs
git commit -m "chore: build da Vercel com testes, noindex de prévia e README"
```

---

### Task 2: Script que verifica uma URL publicada

**Files:**
- Create: `scripts/verificar-deploy.mjs`, `tests/verificar-deploy.test.mjs`

**Interfaces:**
- Produces: `export async function verificar(base: string, buscar = fetch): Promise<string[]>`. Devolve as falhas em texto (uma por item), e `[]` quando tudo passa. Rodando direto (`node scripts/verificar-deploy.mjs <url>`), imprime cada falha, imprime `0 falhas` ou `N falhas` e sai com código 0 ou 1. Usado nas Tasks 4 e 6.

Regras que `verificar` aplica:
- `GET base/`: status 200, `res.redirected === false` e host final igual ao da `base`. O HTML precisa ter `<title>Michelle Fracaro`, e a meta noindex precisa estar presente se e somente se o selo `class="previa"` estiver.
- Para cada `src`/`poster` do HTML: status 200, e o `content-type` precisa começar com `image/webp`, `video/mp4` ou `image/jpeg`, conforme a extensão.
- `docs/conteudo-a-confirmar.md`, `CLAUDE.md`, `tests/pagina.mjs`, `README.md` e `vercel.json` precisam responder 404.

- [ ] **Step 1: Escrever o teste que falha**

Uma `buscar` falsa monta respostas a partir de um mapa `{caminho: {status, type, body, redirected?, url?}}`. O HTML vem de `html` (`tests/pagina.mjs`), e cada mídia referenciada responde 200 com o tipo certo. Caminhos que não estão no mapa respondem 404. `falso(sobrescritas)` mescla as sobrescritas sobre esse mapa padrão.

```js
test('site correto não tem falhas', async () => assert.deepEqual(await verificar(BASE, falso()), []));
test('falha se uma mídia não existir', async () => {
  const f = await verificar(BASE, falso({ 'assets/img/rebel-noise.webp': { status: 404 } }));
  assert.ok(f.some(x => x.includes('assets/img/rebel-noise.webp')));
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
```
Use `BASE = 'https://exemplo.vercel.app'`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tests/verificar-deploy.test.mjs`. Esperado: FAIL (módulo inexistente).

- [ ] **Step 3: Implementar `verificar` e a execução direta**

Para executar direto, comparar `import.meta.url === pathToFileURL(process.argv[1]).href`. Para extrair `src`/`poster`, usar uma regex simples no HTML remoto (sem importar `tests/pagina.mjs`, que lê o arquivo local).

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test "tests/*.test.mjs"`. Esperado: tudo PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts tests/verificar-deploy.test.mjs
git commit -m "feat: script de verificação de deploy"
```

---

### Task 3: Repositório público no GitHub

**Files:** nenhum alterado.

- [ ] **Step 1: Conferir o que vai ficar público**

Run: `git ls-files` e `git grep -n -iE "whatsapp|volunt|irmão|cobran|lucasleria17|telefone"`.
Esperado: só os arquivos do projeto e as mídias de `assets/`. As únicas ocorrências permitidas são menções ao caminho do vault/lux em `CLAUDE.md` e nos planos, e as palavras do próprio plano de deploy ("WhatsApp", "irmão") (conferido em 21/11: nenhum conteúdo do vault está versionado). Qualquer outra ocorrência deve ser mostrada ao Lucas antes de seguir.

- [ ] **Step 2: Confirmar com o Lucas e criar**

```bash
gh repo create lucasgleria/portfolio-michelle-fracaro --public --source . --remote origin --push \
  --description "Portfólio de moda de Michelle Fracaro — HTML estático com manequim 3D (three.js)"
```

- [ ] **Step 3: Verificar**

Run: `gh repo view lucasgleria/portfolio-michelle-fracaro --json visibility,defaultBranchRef --jq '.visibility+" "+.defaultBranchRef.name'`
Esperado: `PUBLIC main`. `git status -sb` mostra `## main...origin/main`.

---

### Task 4: Demo na conta Vercel do Lucas

**Files:**
- Modify: `README.md` (link da demo), `CLAUDE.md`

**Interfaces:**
- Consumes: `vercel.json` (Task 1), `scripts/verificar-deploy.mjs` (Task 2), repo `origin` (Task 3).

- [ ] **Step 1: Importar no painel (o Lucas faz, no navegador)**

Em https://vercel.com/new, logado na conta do Lucas: importar `lucasgleria/portfolio-michelle-fracaro`.
- Project Name: `portfolio-michelle-fracaro-demo`.
- Framework Preset: `Other`.
- Não mexer em Build/Output: o `vercel.json` manda.
- Em Settings → General, conferir Node.js Version ≥ 22.x.
- Deploy.

- [ ] **Step 2: Verificar a demo**

Run: `node scripts/verificar-deploy.mjs https://portfolio-michelle-fracaro-demo.vercel.app`
Esperado: `0 falhas`, código de saída 0.

- [ ] **Step 3: Conferir no celular (o Lucas faz)**

Abrir o link num celular real, numa aba anônima e sem login na Vercel. Conferir:
- o manequim gira;
- as fotos aparecem;
- o vídeo toca dentro da página (no iPhone, sem abrir em tela cheia sozinho);
- o layout em ~390 px não tem rolagem lateral (o headless não chegou a 390 px).

- [ ] **Step 4: Registrar o link**

- `gh repo edit lucasgleria/portfolio-michelle-fracaro --homepage https://portfolio-michelle-fracaro-demo.vercel.app`.
- O link da demo entra no `README.md`.
- No `CLAUDE.md`, uma linha nova: "Demo pública (conta Vercel do Lucas, deploy automático da `main`): https://portfolio-michelle-fracaro-demo.vercel.app".

- [ ] **Step 5: Commit e push**

```bash
git add README.md CLAUDE.md
git commit -m "docs: link da demo pública"
git push
```
Depois do push, a Vercel publica de novo. Rodar o Step 2 outra vez → `0 falhas`.

- [ ] **Step 6: Mandar para a Michelle (o Lucas decide quando)**

Escrever no scratchpad da sessão (fora do repositório, que é público) um texto pronto para o WhatsApp: o link da demo, as perguntas de `docs/conteudo-a-confirmar.md` reescritas em linguagem simples (numeradas, uma linha cada, que dê para responder com "sim", "não" ou poucas palavras) e o pedido de retorno **até 07/12**. O Lucas revisa e envia. Nada é enviado por mim.

Depois do envio, atualizar a nota do projeto no lux: link da demo, retorno combinado até 07/12, decisão de transferir o repositório na entrega e a chamada com o irmão (Task 6).

Este é o ponto de parada: **as Tasks 5 e 6 só começam depois da aprovação dela.**

---

### Task 5: Versão final sem prévia (só depois da aprovação)

**Files:**
- Modify: `index.html` (selo `.previa`, meta robots, segundo `<span>` do footer), `tests/publicacao.test.mjs`
- Create: `docs/manutencao.md`

**Interfaces:**
- Consumes: o teste par selo/noindex (Task 1).

- [ ] **Step 1: Ajustar o teste**

Em `tests/publicacao.test.mjs`, trocar a linha `assert.match(html, /class="previa"/)` por `assert.doesNotMatch(html, /class="previa"/)`. Acrescentar `assert.doesNotMatch(html, /Prévia/)`. O teste do par continua igual.

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tests/publicacao.test.mjs`. Esperado: FAIL.

- [ ] **Step 3: Implementar**

- Remover o `<span class="previa">prévia</span>` e a meta robots.
- O segundo `<span>` do footer vira "Site por Lucas Leria".
- O que a Michelle respondeu na lista de confirmação **não** entra nesta task; isso tem plano próprio.

- [ ] **Step 4: Escrever `docs/manutencao.md` (para o irmão dela)**

Em pt-BR, sem jargão, com seções curtas:
1. **Como o site funciona:** um `index.html` e a pasta `assets/`. Cada push na `main` publica sozinho.
2. **Trocar um texto:** editar direto no GitHub (botão de lápis) e fazer commit na `main`.
3. **Acrescentar um projeto:** a imagem vai em `assets/img/` com nome minúsculo, sem acento e sem espaço. Depois, copiar um bloco `<a class="peca">` e ajustar `src`, `alt`, `width`/`height` com o tamanho real, `href` e `aria-label`.
4. **Se o site não atualizou:** em Vercel → Deployments, um build vermelho significa que um teste falhou e o site anterior continua no ar. Abrir o log e corrigir o que o teste aponta.
5. **Conferir depois de publicar:** `node scripts/verificar-deploy.mjs https://portfolio-michelle-fracaro.vercel.app`.
6. **Quem chamar:** Lucas, colaborador do repositório.

- [ ] **Step 5: Rodar e ver passar**

Run: `node --test "tests/*.test.mjs"`. Esperado: tudo PASS.

- [ ] **Step 6: Commit e push**

```bash
git add index.html tests/publicacao.test.mjs docs/manutencao.md
git commit -m "feat: versão final sem prévia e guia de manutenção"
git push
```
A demo passa a mostrar a versão final. Rodar `node scripts/verificar-deploy.mjs https://portfolio-michelle-fracaro-demo.vercel.app` → `0 falhas`.

---

### Task 6: Entrega na conta dela (só depois da aprovação)

**Files:**
- Modify: `README.md`, `CLAUDE.md` (links finais)

`<conta-dela>` é o usuário do GitHub que ela (ou o irmão) criar no Step 1.

- [ ] **Step 1: Contas dela (com a Michelle, no navegador)**

Criar a conta no GitHub (`<conta-dela>`). Depois, criar a conta Vercel Hobby com "Continue with GitHub" usando essa conta, para que o login dela seja o GitHub.

- [ ] **Step 2: Transferir o repositório (confirmar com o Lucas)**

Run: `gh api -X POST repos/lucasgleria/portfolio-michelle-fracaro/transfer -f new_owner=<conta-dela>`
Ela aceita pelo e-mail do GitHub. Depois, em Settings → Collaborators, adiciona `lucasgleria` e o irmão.
Run: `git remote set-url origin https://github.com/<conta-dela>/portfolio-michelle-fracaro.git && git fetch`
Esperado: o fetch funciona, e `gh api repos/<conta-dela>/portfolio-michelle-fracaro/collaborators --jq '.[].login'` lista `lucasgleria`.

- [ ] **Step 3: Importar na Vercel dela (com a Michelle)**

Em https://vercel.com/new, logada como ela: importar `<conta-dela>/portfolio-michelle-fracaro`.
- Project Name: `portfolio-michelle-fracaro`.
- Framework Preset: `Other`.
- Conferir Node.js Version ≥ 22.x.
- Deploy.

- [ ] **Step 4: Verificar o site final**

Run: `node scripts/verificar-deploy.mjs https://portfolio-michelle-fracaro.vercel.app`
Esperado: `0 falhas`.
Depois, o Lucas faz um commit pequeno e um push (por exemplo, os links do Step 5). Conferir em Vercel → Deployments que o push publicou sozinho na conta dela.

- [ ] **Step 5: Atualizar links e mandar o novo para ela**

- `gh repo edit <conta-dela>/portfolio-michelle-fracaro --homepage https://portfolio-michelle-fracaro.vercel.app`.
- `README.md` e `CLAUDE.md` passam a apontar para o endereço final.
- No `<head>` do `index.html`, `og:url` e `og:image` passam para `https://portfolio-michelle-fracaro.vercel.app/` (e o `BASE` do teste de prévia do link em `tests/publicacao.test.mjs`). Sem isso, a prévia no WhatsApp quebra quando a demo for apagada no Step 7.
- Commit `docs: endereço final na conta da Michelle` e push.
- O Lucas manda o link final para ela.

- [ ] **Step 6: Chamada com o irmão (~30 min, o Lucas conduz)**

Seguindo `docs/manutencao.md`, o irmão faz uma edição real pelo GitHub (por exemplo, um texto confirmado pela Michelle) e acompanha o deploy em Vercel → Deployments até o site mudar. Se der tempo, ele faz um commit que quebra um teste, vê o build vermelho com o site anterior no ar e desfaz.
Esperado: ele publica sozinho uma mudança e sabe onde olhar quando o build falha.

- [ ] **Step 7: Desligar a demo (só depois do Step 5)**

Na conta Vercel do Lucas: Project `portfolio-michelle-fracaro-demo` → Settings → Delete.
Run: `curl -s -o /dev/null -w "%{http_code}" https://portfolio-michelle-fracaro-demo.vercel.app` → `404`.
Atualizar a nota do projeto no lux (status, link final, Lucas só como colaborador e sem fork). Isso fica fora do repositório.
