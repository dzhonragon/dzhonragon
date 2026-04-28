---
title: "Usando MongoDB e Neo4j no mesmo serviço, por razões reais"
description: "Uma API de recomendação de amizade onde o MongoDB armazena documentos de usuário e o Neo4j mantém o grafo de amizades — cada banco fazendo o que foi construído para fazer."
pubDate: 2026-04-25
tags: ["java", "spring-boot", "neo4j", "mongodb"]
linkedTranslation: "relations"
github: "https://github.com/dzhonragon/relations"
---

A funcionalidade "pessoas que você talvez conheça" parece trivial até você tentar implementá-la sem um banco de grafos. No MongoDB, você acabaria embutindo arrays de amigos dentro de documentos e percorrendo-os no código da aplicação. Para um salto, tudo bem. Para dois saltos — amigos de amigos — você está fazendo múltiplas queries, deduplicando em memória e o código fica bagunçado rapidamente. No Neo4j, a mesma coisa é uma query Cypher de três linhas.

O projeto usa os dois. O MongoDB armazena documentos de usuários. O Neo4j armazena o grafo de amizades. Cada banco cuida do que foi projetado para fazer.

### A query Cypher que importa

Quando você chama `GET /users/{id}/recommendations`, o serviço executa isso no Neo4j:

```cypher
MATCH (u:User {id: $userId})-[:FRIENDS]->(f1:User)-[:FRIENDS]->(f2:User)
WHERE NOT (u)-[:FRIENDS]->(f2) AND u.id <> f2.id
RETURN DISTINCT f2
LIMIT 10
```

Isso percorre o grafo dois saltos para fora, filtra conexões existentes e o próprio usuário, e retorna resultados distintos. O Neo4j está fazendo a travessia do grafo nativamente. Replicar isso num banco de documentos exigiria múltiplos joins no nível da aplicação e deduplicação explícita.

### Como o serviço conecta os dois bancos

A query retorna uma lista de nós User do Neo4j com seus IDs. O serviço então pega esses IDs e busca os documentos completos de usuário no MongoDB. Duas chamadas de banco no total, com uma fronteira limpa entre elas: o Neo4j responde "quem deveríamos recomendar?" e o MongoDB responde "qual é o perfil completo deles?"

A arquitetura é `UserController → UserService → { UserDocumentRepository (MongoDB), UserGraphRepository (Neo4j) }`. O serviço é o ponto de encontro. Nenhum repositório sabe que o outro existe.

### Integração Spring Boot Docker Compose

Rodar localmente é só `./mvnw spring-boot:run`. O Spring Boot 3.5 detecta o `compose.yaml` e inicia o MongoDB e o Neo4j automaticamente. Você não precisa rodar `docker compose up` manualmente. Esse comportamento foi adicionado no Spring Boot 3.1 — o framework gerencia o ciclo de vida dos contêineres como parte do contexto da aplicação.

### O que o design deixou de fora de propósito

Sem CQRS, sem barramento de eventos, sem camadas além de controller → service → repositories. Isso foi intencional. O ponto era mostrar como os dois bancos se encaixam, não enterrar isso em código de infraestrutura. A persistência poliglota é a parte interessante; a arquitetura ao redor deve ser o mais enxuta possível.

Vale notar: a query Cypher tem um `LIMIT 10` fixo no código e não há tratamento para o caso em que um nó Neo4j existe mas o documento MongoDB correspondente não. Num sistema de produção você precisaria de um processo de reconciliação ou verificações explícitas de nulo na etapa de hidratação. Para o escopo deste projeto, essas são lacunas aceitáveis.
