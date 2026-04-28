---
title: "An HTML shorthand compiler built with ANTLR4"
description: "How I built 4less: an ANTLR4 grammar as the single source of truth, a Node.js visitor that emits HTML, and a CLI with watch mode."
pubDate: 2026-04-25
tags: ["nodejs", "antlr4", "compilers", "javascript"]
linkedTranslation: "4less"
github: "https://github.com/dzhonragon/4less"
---

4less exists because I kept writing the same angle-bracket noise in HTML templates. The idea was simple: give each element a line, let indentation signal nesting, and handle `#id` and `.class` shorthands inline. Something like:

```
div#app.container {
  h1.title "Hello"
  p "World"
  a "Docs" href:"/docs"
}
```

That compiles to a single-line HTML string with all the attributes in the right place. No closing tags to track, no repeated class="..." boilerplate.

### Grammar as the source of truth

The entire syntax is defined in `src/parser/Grammar.g4`. That file is the source of truth. ANTLR4 reads it and generates the lexer and parser. If the syntax needs to change — a new shorthand, a different attribute order — you edit the grammar and run `npm run generate`. The generated files are committed to the repo so the project runs without the ANTLR4 toolchain present. Java is only needed once, during the initial generation.

ANTLR4 has a JavaScript runtime target, so the generated lexer and parser run directly in Node 20+ without any JVM at runtime.

### The visitor

The visitor is `HtmlGenerator`, which subclasses the generated `GrammarVisitor`. It walks the parse tree node by node and emits HTML strings. The key methods are `visitElementBlock` for elements with children and `visitElementSelf` for self-closing tags.

Shorthands (`#id`, `.class`) are processed by collecting all `shorthand()` children from the context, splitting them by type, and building the `id=""` and `class=""` attribute strings before merging with the explicit attributes. The order is always shorthands first, then explicit attributes, then text content, then children — which matches the grammar's production rule.

The output is string concatenation. No DOM, no virtual tree, no intermediate representation. Simple and easy to test.

### Error reporting

ANTLR4's default error listener writes to stderr and continues parsing. I replaced it with a custom collector that accumulates all errors, then throws a `ParseError` at the end with the full list. Each error includes the line and column number from the token stream, so the CLI output tells you exactly where the problem is:

```
$ echo '{ orphan }' | node src/cli.js
line 1:0 extraneous input '{' expecting {<EOF>, ID}
```

### CLI modes

Three modes: pipe from stdin to stdout, compile a file to a target, and compile with `--watch`. Watch mode uses `fs.watch` on the source file and recompiles on each change. Simple to implement and useful enough to include.

### Tests

26 tests covering self-closing tags, text nodes, attributes, shorthands, nesting, siblings, and error cases. Written with Vitest. Each test is a short input string and its expected HTML output — easy to read and extend when the grammar changes.

The design decision I'm most happy with: the grammar being the only thing you need to modify to extend the language. Everything downstream — lexer, parser, visitor — adapts automatically after `npm run generate`.
