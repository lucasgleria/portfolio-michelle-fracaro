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

No projeto da Vercel, a versão do Node precisa ser 22 ou mais nova (Settings → Build and Deployment → Node.js Version).

## Trocar ou incluir fotos

As fotos ficam em `assets/img/` e precisam estar em **.webp** com nome em minúsculas e hífens (ex.: `nova-colecao-2.webp`). No `<img>`, `width` e `height` devem ser o tamanho real do arquivo; os testes avisam se não forem. Para converter uma foto do celular: `cwebp -q 82 foto.jpg -o assets/img/nova-colecao.webp` (ou qualquer conversor on-line de JPG para WebP).

## Direitos

Fotos, vídeo e textos © Michelle Fracaro e fotógrafos creditados no Instagram; não reutilizar. Código e 3D por Lucas Leria.

Sem licença: todo o conteúdo é reservado.
