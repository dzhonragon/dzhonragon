---
title: "CQRS in practice: building a poll system across three Spring Boot services"
description: "How I structured three microservices around CQRS, Kafka, and Redis — what the split actually buys you and where the friction is."
pubDate: 2026-04-24
tags: ["java", "spring-boot", "kafka", "redis", "cqrs"]
linkedTranslation: "realtime-poll-system"
github: "https://github.com/dzhonragon/realtime-poll-system"
---

The first decision was whether to write a single service or split by command and query from the start. I went with the split. Not because it's simpler — it isn't — but because the whole point of the project was to work through what CQRS actually means when you implement it, not just read about it.

The architecture ended up as three services: poll-service handles poll creation, vote-service handles vote ingestion, and result-service maintains the read model. poll-service and vote-service are the command side. result-service is the query side. They don't share a database. The write side has one PostgreSQL instance, the read side has another.

### The event that ties them together

When a vote lands in vote-service, it gets written to the write DB and published to a Kafka topic. result-service consumes that event, increments the vote count in its own read DB, and evicts the Redis cache for that poll. The event is `VoteRegisteredEvent`.

One thing that caused friction early on: all three services needed to share the event schema. The solution was a fourth Maven module — `shared/event-models` — compiled as a JAR and installed locally. Every service declares it as a dependency. It's a bit bureaucratic for a small project, but it mirrors how you'd actually do it in a codebase with multiple teams working on different services.

### Why two PostgreSQL instances

The write DB has a normalized schema. The read DB stores pre-aggregated results per option. When a new vote comes in, result-service doesn't run any joins — it increments a counter in `poll_results` and serves the cached value from Redis.

Redis eviction happens at the right granularity: when a `VoteRegisteredEvent` arrives, the consumer evicts the cache for that specific `pollId`. The next GET for that poll hits the read DB, recomputes, and puts the fresh value back in cache. Cache-aside, straightforward. Poll results can tolerate a brief window of eventual consistency, so this works fine here.

### Load testing with k6

I added a k6 load test to have something concrete to run against the system. The thresholds — p95 vote latency under 500ms, p95 result latency under 200ms, error rate under 1% — aren't arbitrary numbers. They're the kind of targets you'd actually care about in a real-time voting context.

The script ramps up to 50 virtual users, casts votes, and reads results concurrently. Running it while watching the Docker stats gives a clear picture of where the bottlenecks are.

### Running it locally

The infrastructure is fully Dockerized: two PostgreSQL instances, Kafka with Zookeeper, Redis, all in one compose file. The services use a `local` Spring profile that switches hostnames from Docker network names to `localhost`, so you can run the JVM processes outside Docker while keeping the infrastructure containers up. That way you get fast reload times during development without sacrificing the real dependencies.

### What I'd look at next

The current consumer group setup doesn't handle result-service restarts cleanly. When it comes back up, it picks up from wherever the Kafka offset is, which could skip events if the service was down during a burst. Storing the consumer offset alongside the read model state would make the reprocessing story more reliable. That's the most significant gap in the current design.
