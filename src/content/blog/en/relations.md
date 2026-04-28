---
title: "Using MongoDB and Neo4j in the same service, for real reasons"
description: "A friend recommendation API where MongoDB stores user documents and Neo4j holds the friendship graph — each database doing what it was built for."
pubDate: 2026-04-25
tags: ["java", "spring-boot", "neo4j", "mongodb"]
linkedTranslation: "relations"
github: "https://github.com/dzhonragon/relations"
---

The "people you may know" feature seems trivial until you try to implement it without a graph database. In MongoDB, you'd end up embedding friend arrays inside documents and traversing them in application code. For one hop that's fine. For two hops — friends of friends — you're doing multiple queries, deduplicating in memory, and the code gets messy fast. In Neo4j, the same thing is a three-line Cypher query.

The project uses both. MongoDB stores user documents. Neo4j stores the friendship graph. Each database handles what it was designed for.

### The Cypher query that matters

When you call `GET /users/{id}/recommendations`, the service runs this against Neo4j:

```cypher
MATCH (u:User {id: $userId})-[:FRIENDS]->(f1:User)-[:FRIENDS]->(f2:User)
WHERE NOT (u)-[:FRIENDS]->(f2) AND u.id <> f2.id
RETURN DISTINCT f2
LIMIT 10
```

That traverses the graph two hops out, filters out existing connections and the user themselves, and returns distinct results. Neo4j is doing the graph traversal natively. Replicating this in a document database would require multiple application-level joins and explicit deduplication.

### How the service bridges the two databases

The query returns a list of Neo4j User nodes with their IDs. The service then takes those IDs and fetches the full user documents from MongoDB. Two database calls total, with a clean boundary between them: Neo4j answers "who should we recommend?" and MongoDB answers "what's their full profile?"

The architecture is `UserController → UserService → { UserDocumentRepository (MongoDB), UserGraphRepository (Neo4j) }`. The service is the meeting point. Neither repository knows the other exists.

### Spring Boot Docker Compose integration

Running this locally is just `./mvnw spring-boot:run`. Spring Boot 3.5 detects the `compose.yaml` and starts MongoDB and Neo4j automatically. You don't need to run `docker compose up` yourself. This behavior was added in Spring Boot 3.1 — the framework manages the container lifecycle as part of the application context.

### What the design deliberately left out

There's no CQRS, no event bus, no extra layers beyond controller → service → repositories. That was intentional. The point was to show how the two databases fit together, not to bury that in infrastructure code. The polyglot persistence is the interesting part; the surrounding architecture should be as thin as possible.

One thing worth noting: the Cypher query has a hardcoded `LIMIT 10` and there's no handling for the case where a Neo4j node exists but the corresponding MongoDB document doesn't. In a production system you'd want either a reconciliation process or explicit null checks on the hydration step. For the scope of this project, those are acceptable gaps.
