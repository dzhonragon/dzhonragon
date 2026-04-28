---
title: "Um produtor Python e um consumidor Go compartilhando uma fila no RabbitMQ"
description: "Mensageria entre linguagens com pika e streadway/amqp: ack manual, retries na inicialização e uma imagem Docker Go construída do zero."
pubDate: 2026-04-26
tags: ["python", "golang", "rabbitmq", "docker"]
linkedTranslation: "python-golang-rabbitmq"
github: "https://github.com/dzhonragon/python-and-golang-integration-with-rabbitmq"
---

O projeto é um exemplo mínimo de mensageria entre linguagens. Python publica uma mensagem JSON a cada poucos segundos; Go consome e reconhece cada uma. Ambos se conectam à mesma fila do RabbitMQ, configurada por variáveis de ambiente.

A decisão interessante foi o reconhecimento manual no lado do consumidor. O comportamento padrão de auto-ack do RabbitMQ reconhece a mensagem assim que ela é entregue. Com ack manual, o Go chama explicitamente `d.Ack(false)` após o processamento. Se o consumidor travar ou o canal fechar antes do ack, o RabbitMQ recoloca a mensagem na fila em vez de descartá-la. Para um exemplo simples, essa é a diferença entre "funciona basicamente" e "trata falhas corretamente."

### Retries na inicialização

Nem Python nem Go assumem que o RabbitMQ está pronto quando o contêiner inicia. Ambos implementam um loop de retry: tentam se conectar, dormem brevemente se falhar, tentam de novo. Isso importa no Docker Compose porque o contêiner do RabbitMQ leva alguns segundos para ficar saudável mesmo depois que o Docker relata que ele está rodando. Sem a lógica de retry, ambos os serviços travariam na inicialização e o Docker reportaria os contêineres como encerrados.

O retry é simples nos dois casos — um loop com um pequeno sleep entre tentativas, sem backoff exponencial. Suficiente para um setup de desenvolvimento.

### Tamanhos das imagens Docker

A imagem Go usa um build em duas etapas. O binário é compilado em `golang:1.22-alpine` e depois copiado para uma imagem `scratch` sem nenhuma camada de sistema operacional. A imagem final fica em torno de 6 MB. O `scratch` não tem shell, gerenciador de pacotes nem libc. O binário precisa ser linkado estaticamente, o que o Go produz por padrão. O resultado é uma imagem pequena e reproduzível sem nenhuma superfície além do próprio binário.

A imagem Python usa `python:3.11-slim` e roda como usuário não-root. Ainda é maior que a imagem Go, mas o slim dá uma base razoável sem puxar pacotes desnecessários.

### Configuração

Ambos os serviços leem de variáveis de ambiente: `RABBITMQ_HOST`, `RABBITMQ_USER`, `RABBITMQ_PASS`, `RABBITMQ_QUEUE` e `PUBLISH_INTERVAL` para o produtor Python. Os padrões correspondem a uma instalação padrão do RabbitMQ, então `docker compose up` funciona após `cp .env.example .env` sem editar nada.

A UI de gerenciamento do RabbitMQ roda na porta 15672. Ela mostra profundidade da fila, taxas de mensagem e contagem de consumidores em tempo real. Com um intervalo de publicação de 3 segundos e um consumidor, a profundidade da fila deve ficar perto de zero em condições normais. Observar isso enquanto para o contêiner Go confirma o comportamento de requeue — as mensagens se acumulam e depois drenam quando o consumidor volta.

### O que demonstra

Isso não é uma arquitetura de mensageria para produção. É uma visão concreta de como é a integração AMQP entre linguagens no nível do código: como o `pika` e o `streadway/amqp` tratam declarações de canal, bindings de fila e publicação em cada lado. O ack manual e o loop de retry são as duas coisas que valem levar para qualquer projeto real que use esse padrão.
