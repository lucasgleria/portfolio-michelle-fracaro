# Michelle Fracaro — Portfólio de moda

Site-portfólio da estilista Michelle Fracaro: uma página só (`index.html`), com manequim de moulage 3D em three.js, coleções, vídeo e contato. As fotos e o vídeo ficam em `assets/`.

Demo: _(link entra depois do primeiro deploy)_

## Testes

Precisa do Node 22 ou mais novo, sem instalar nada:

```bash
node --test "tests/*.test.mjs"
```

## Como publicar

Push na `main` → a Vercel roda os testes e publica. Se um teste falhar, nada muda no ar.

Só `index.html` e `assets/` são publicados (veja `vercel.json`).

## Direitos

Fotos, vídeo e textos © Michelle Fracaro e fotógrafos creditados no Instagram; não reutilizar. Código e 3D por Lucas Leria.

Sem licença: todo o conteúdo é reservado.
