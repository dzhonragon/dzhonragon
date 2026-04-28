---
title: "Construindo uma linguagem estaticamente tipada sobre Python, com Lark"
description: "Como o Tusk foi construído: uma gramática Lark, um verificador de tipos que roda antes da execução e um interpretador baseado em visitor — tudo em Python."
pubDate: 2026-04-24
tags: ["python", "compiladores", "interpretadores", "lark"]
linkedTranslation: "tusk"
github: "https://github.com/dzhonragon/tusk"
---

O Tusk começou como uma pergunta: dá pra escrever uma linguagem com tipos estáticos e operador pipe sem construir um compilador do zero? A resposta foi quase sim, com Python fazendo a maior parte do trabalho pesado.

A gramática fica num único arquivo `.lark`. O Lark faz o parsing e gera uma árvore de análise, que um transformer converte numa AST de dataclasses Python. Depois disso, o verificador de tipos percorre a AST antes de qualquer execução. Se o programa passa na verificação, o interpretador caminha pela mesma AST e a avalia. Essa ordem — parsear, verificar, executar — é a espinha dorsal de todo o pipeline.

### O operador pipe

O operador pipe foi a funcionalidade que eu mais queria. `valor |> função` redireciona o resultado da esquerda como primeiro argumento para a função à direita. Funciona no nível do parser: `pipe_expr` é uma produção explícita na gramática, e na hora da avaliação o interpretador coloca o valor da esquerda na frente da lista de argumentos antes de chamar a função. Mecanismo simples. O `pipe_target` à direita pode receber argumentos adicionais depois do nome da função, o que dá aplicação parcial sem precisar de closures.

### Inferência de tipos e escopos

Inferência de tipos em declarações de variáveis sem anotação foi uma das partes mais difíceis de acertar. Se você escreve `nome = "Gemini"`, o verificador de tipos precisa inferir `str` a partir da expressão à direita e vinculá-la no ambiente de tipos. Depois, se você escrever `nome = 42`, falha. O ambiente de tipos é um dict por escopo, encadeado com o escopo envolvente. Acertar esse encadeamento entre definições de função, ramos if/elif/else e expressões pipe levou algumas iterações.

Funções são registradas no ambiente de tipos antes de o corpo ser verificado, o que habilita recursão. Uma função que chama a si mesma verifica corretamente os tipos mesmo que o corpo ainda não tenha sido analisado quando a entrada da função é criada.

### Padrão visitor, duas vezes

O padrão visitor aparece tanto no verificador de tipos quanto no interpretador. Ambos herdam de `NodeVisitor`, que usa dispatch via `getattr` para chamar `visit_NomeDoNó` em cada nó. A alternativa seriam cadeias de `isinstance`, mas isso fica ruim rapidamente com quinze tipos de nó. O dispatch por `getattr` é O(1) e mantém cada método do visitor pequeno e focado.

Uma coisa que não era óbvia: a prioridade de keywords na gramática. O Lark atribui prioridade 0 ao terminal NAME por padrão. Se BOOL tivesse a mesma prioridade, `true` poderia ser analisado como NAME em certos contextos. Subir BOOL, FLOAT e todas as keywords para prioridade 2 faz elas sempre ganharem do NAME, que é o comportamento correto.

### O guarda de profundidade de chamada

O interpretador tem um `_MAX_CALL_DEPTH = 500`. Sem isso, recursão profunda num programa Tusk levantaria um `RecursionError` do Python com um stack trace confuso. O guarda pega esse caso e levanta um `TuskRuntimeError` com uma mensagem que faz sentido para o usuário da linguagem, não para as entranhas do Python.

### Onde está áspero

O REPL analisa e avalia uma instrução por vez num ambiente persistente, o que funciona para expressões simples e atribuições. Definir uma função multilinha no REPL é inconveniente porque não há suporte para linhas de continuação. Essa é a limitação mais perceptível quando se usa de forma interativa.
