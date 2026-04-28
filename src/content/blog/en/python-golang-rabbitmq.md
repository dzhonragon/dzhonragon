---
title: "A Python producer and a Go consumer sharing one RabbitMQ queue"
description: "Cross-language messaging with pika and streadway/amqp: manual ack, startup retries, and a Go Docker image built from scratch."
pubDate: 2026-04-26
tags: ["python", "golang", "rabbitmq", "docker"]
linkedTranslation: "python-golang-rabbitmq"
github: "https://github.com/dzhonragon/python-and-golang-integration-with-rabbitmq"
---

The project is a minimal cross-language messaging example. Python publishes a JSON message every few seconds; Go consumes and acknowledges each one. Both connect to the same RabbitMQ queue, configured through environment variables.

The interesting decision was manual acknowledgement on the consumer side. RabbitMQ's default auto-ack behavior acknowledges the message as soon as it's delivered. With manual ack, Go explicitly calls `d.Ack(false)` after processing. If the consumer crashes or the channel closes before the ack, RabbitMQ requeues the message instead of dropping it. For a simple example, this is the difference between "basically works" and "handles failures correctly."

### Startup retries

Neither Python nor Go assumes RabbitMQ is ready when the container starts. Both implement a retry loop: try to connect, sleep briefly if it fails, try again. This matters in Docker Compose because the RabbitMQ container takes a few seconds to become healthy even after Docker reports it as running. Without the retry logic, both services would crash on startup and Docker would report the containers as exited.

The retry is simple in both cases — a loop with a small sleep between attempts, no exponential backoff. Sufficient for a development setup.

### Docker image sizes

The Go image uses a two-stage build. The binary is compiled in `golang:1.22-alpine` and then copied into a `scratch` image with no operating system layer at all. The final image is around 6 MB. `scratch` has no shell, no package manager, no libc. The binary needs to be statically linked, which Go produces by default. The result is a small, reproducible image with no surface area beyond the binary itself.

The Python image uses `python:3.11-slim` and runs as a non-root user. That's still larger than the Go image, but slim gives a reasonable baseline without pulling in unnecessary packages.

### Configuration

Both services read from environment variables: `RABBITMQ_HOST`, `RABBITMQ_USER`, `RABBITMQ_PASS`, `RABBITMQ_QUEUE`, and `PUBLISH_INTERVAL` for the Python producer. The defaults match a standard RabbitMQ installation, so `docker compose up` works after `cp .env.example .env` without editing anything.

The RabbitMQ management UI runs on port 15672. It shows queue depth, message rates, and consumer count in real time. With a publish interval of 3 seconds and one consumer, the queue depth should stay near zero under normal conditions. Watching it while stopping the Go container confirms the requeue behavior — messages pile up and then drain when the consumer comes back.

### What it demonstrates

This isn't a production messaging architecture. It's a concrete look at what cross-language AMQP integration looks like at the code level: how `pika` and `streadway/amqp` handle channel declarations, queue bindings, and publishing on each side. The manual ack and the retry loop are the two things worth carrying over to any real project that uses this pattern.
