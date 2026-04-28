---
title: "Um compilador de atalhos HTML com ANTLR4"
description: "Como construí o 4less: uma gramática ANTLR4 como fonte de verdade, um visitor Node.js que emite HTML e um CLI com modo de observação."
pubDate: 2026-04-25
tags: ["nodejs", "antlr4", "compiladores", "javascript"]
linkedTranslation: "4less"
github: "https://github.com/dzhonragon/4less"
---

O 4less existe porque eu ficava escrevendo o mesmo ruído de colchetes angulares em templates HTML. A ideia foi simples: dar a cada elemento uma linha, deixar a indentação sinalizar aninhamento e tratar os atalhos `#id` e `.class` inline. Algo assim:

```
div#app.container {
  h1.title "Hello"
  p "World"
  a "Docs" href:"/docs"
}
```

Isso compila para uma string HTML numa única linha com todos os atributos no lugar certo. Sem tags de fechamento para rastrear, sem o mesmo `class="..."` repetido.

### Gramática como fonte de verdade

Toda a sintaxe é definida em `src/parser/Grammar.g4`. Esse arquivo é a fonte de verdade. O ANTLR4 o lê e gera o lexer e o parser. Se a sintaxe precisar mudar — um novo atalho, uma ordem diferente de atributos — você edita a gramática e roda `npm run generate`. Os arquivos gerados são commitados no repositório para que o projeto funcione sem a toolchain do ANTLR4 presente. Java é necessário apenas uma vez, durante a geração inicial.

O ANTLR4 tem um target de runtime JavaScript, então o lexer e parser gerados rodam diretamente no Node 20+ sem nenhuma JVM em tempo de execução.

### O visitor

O visitor é `HtmlGenerator`, que herda do `GrammarVisitor` gerado. Ele percorre a árvore de análise nó a nó e emite strings HTML. Os métodos principais são `visitElementBlock` para elementos com filhos e `visitElementSelf` para tags auto-fechantes.

Os atalhos (`#id`, `.class`) são processados coletando todos os filhos `shorthand()` do contexto, separando-os por tipo e construindo as strings de atributos `id=""` e `class=""` antes de mesclar com os atributos explícitos. A ordem é sempre: atalhos primeiro, depois atributos explícitos, depois conteúdo de texto, depois filhos — o que corresponde à regra de produção da gramática.

A saída é concatenação de strings. Sem DOM, sem árvore virtual, sem representação intermediária. Simples e fácil de testar.

### Reporte de erros

O listener de erros padrão do ANTLR4 escreve no stderr e continua o parsing. Substituí isso por um coletor customizado que acumula todos os erros e lança um `ParseError` ao final com a lista completa. Cada erro inclui o número de linha e coluna do stream de tokens, então a saída do CLI diz exatamente onde está o problema:

```
$ echo '{ orphan }' | node src/cli.js
line 1:0 extraneous input '{' expecting {<EOF>, ID}
```

### Modos do CLI

Três modos: pipe de stdin para stdout, compilar um arquivo para um destino e compilar com `--watch`. O modo watch usa `fs.watch` no arquivo-fonte e recompila a cada mudança. Simples de implementar e útil o suficiente para incluir.

### Testes

26 testes cobrindo tags auto-fechantes, nós de texto, atributos, atalhos, aninhamento, irmãos e casos de erro. Escritos com Vitest. Cada teste é uma string de entrada curta e sua saída HTML esperada — fácil de ler e estender quando a gramática muda.

A decisão de design com que mais estou satisfeito: a gramática ser a única coisa que você precisa modificar para estender a linguagem. Tudo downstream — lexer, parser, visitor — se adapta automaticamente após `npm run generate`.
