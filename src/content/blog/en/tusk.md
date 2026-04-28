---
title: "Building a statically typed language on top of Python, with Lark"
description: "How Tusk came together: a Lark grammar, a type checker that runs before execution, and a tree-walking interpreter — all in Python."
pubDate: 2026-04-24
tags: ["python", "compilers", "interpreters", "lark"]
linkedTranslation: "tusk"
github: "https://github.com/dzhonragon/tusk"
---

Tusk started as a question: can I write a language that has static types and a pipe operator without building a full compiler from scratch? The answer was mostly yes, with Python doing most of the lifting.

The grammar lives in a single `.lark` file. Lark parses it and generates a parse tree, which a transformer converts into an AST made of Python dataclasses. After that, the type checker runs over the AST before any execution. If the program passes type checking, the interpreter walks the same AST and evaluates it. That ordering — parse, check, run — is the backbone of the whole pipeline.

### The pipe operator

The pipe operator was the feature I wanted most. `valor |> função` redirects the left-hand result as the first argument to the function on the right. It works at the parser level: `pipe_expr` is an explicit production in the grammar, and at evaluation time the interpreter prepends the left-hand value to the argument list before calling the function. Simple mechanism. `pipe_target` on the right side can take additional arguments after the function name, which gives you partial application without needing closures.

### Type inference and scoping

Type inference on variable declarations without annotations was one of the harder parts to get right. If you write `nome = "Gemini"`, the type checker has to infer `str` from the right-hand expression and bind it in the type environment. Then if you later write `nome = 42`, it fails. The type environment is a dict per scope, chained with the enclosing scope. Getting that chain right across function definitions, if/elif/else branches, and pipe expressions took a few iterations.

Functions are registered in the type environment before their body is checked, which enables recursion. A function that calls itself type-checks correctly even though the body hasn't been verified yet when the function entry is created.

### Visitor pattern, twice

The visitor pattern shows up in both the type checker and the interpreter. Both subclass `NodeVisitor`, which uses `getattr` dispatch to call `visit_ClassName` for each node. The alternative would be `isinstance` chains, but that gets unwieldy quickly with fifteen node types. The `getattr` dispatch is O(1) and keeps each visitor method small and focused.

One thing that was non-obvious: keyword priority in the grammar. Lark assigns priority 0 to NAME tokens by default. If BOOL had the same priority, `true` might parse as NAME in certain contexts. Bumping BOOL, FLOAT, and all keywords to priority 2 makes them always win over NAME, which is the right behavior.

### The call depth guard

The interpreter has a `_MAX_CALL_DEPTH = 500` guard. Without it, deep recursion in a Tusk program would raise a Python `RecursionError` with a confusing stack trace. The guard catches that case and raises a `TuskRuntimeError` instead, with a message that makes sense to the language user rather than the Python internals.

### Where it's rough

The REPL parses and evaluates one statement at a time in a persistent environment, which works for simple expressions and assignments. Defining a multi-line function in the REPL is awkward because there's no support for continuation lines. That's the most noticeable limitation when actually using it interactively.
