# Trato — kit de identidade visual (base aprovada)

Este kit **usa diretamente a arte da capivara e o lettering “Trato” da referência aprovada**; não substitui o desenho por outra versão. A assinatura foi atualizada para a frase definitiva:

> **Do planejamento à fiscalização, tudo bem tratado.**

## Estrutura

- `readme/trato-header-light.png` e `trato-header-dark.png` — cabeçalho do repositório
- `logo/trato-horizontal-light.svg` e `trato-horizontal-dark.svg` — logotipo sem slogan
- `logo/trato-horizontal-slogan-light.svg` e versão dark — com slogan
- `logo/trato-mascote.png` — capivara original isolada
- `logo/trato-wordmark.png` — lettering aprovado isolado
- `readme/headings/` — títulos decorativos opcionais
- `favicon/favicon.svg`, `favicon.ico` e PNGs 16–512px — ícone do navegador/app
- `preview.png` — amostra visual de uso

## Inserir no README do GitHub

Copie todo o conteúdo do kit para `assets/branding/` no repositório e use no início do `README.md`:

```html
<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/branding/readme/trato-header-dark.png">
    <img src="assets/branding/readme/trato-header-light.png" alt="Trato — Do planejamento à fiscalização, tudo bem tratado." width="1000">
  </picture>
</h1>

<p align="center"><strong>Tramitação, Registro, Acompanhamento, Transparência e Obrigações</strong></p>
```

Mantenha as seções `##` do README em texto Markdown para navegação e acessibilidade. Os headings ilustrados são opcionais e podem ser colocados abaixo de cada título.

## Favicon no produto web

```html
<link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg">
<link rel="icon" type="image/x-icon" href="/favicon/favicon.ico">
<link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png">
```

O GitHub não permite definir o favicon da página do repositório; ele será usado quando o Trato tiver sua interface web.

## Observação sobre os arquivos SVG

Para preservar com fidelidade **a mesma capivara aprovada**, os arquivos `.svg` contêm imagens PNG embutidas em um invólucro SVG, e não desenhos vetoriais editáveis por curvas. Eles funcionam sem recursos externos e podem ser exibidos no GitHub, mas sua ampliação além da resolução original tem os limites de uma imagem raster. As versões PNG estão incluídas.

O arquivo `source/referencia-aprovada.png` está incluído como origem visual; o kit está organizado para implementação imediata.
