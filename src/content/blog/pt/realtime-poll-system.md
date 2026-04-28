---
title: "CQRS na prática: construindo um sistema de enquetes em três serviços Spring Boot"
description: "Como estruturei três microsserviços em torno de CQRS, Kafka e Redis — o que a separação realmente traz e onde está o atrito."
pubDate: 2026-04-24
tags: ["java", "spring-boot", "kafka", "redis", "cqrs"]
linkedTranslation: "realtime-poll-system"
github: "https://github.com/dzhonragon/realtime-poll-system"
---

A primeira decisão foi se eu escreveria um único serviço ou separaria comando e consulta desde o início. Escolhi separar. Não porque fosse mais simples — não é — mas porque o objetivo do projeto era entender o que CQRS significa na prática, não apenas lê-lo num artigo.

A arquitetura ficou com três serviços: poll-service para criação de enquetes, vote-service para ingestão de votos e result-service para o modelo de leitura. Os dois primeiros são o lado de comando. O result-service é o lado de consulta. Eles não compartilham banco de dados. O lado de escrita tem uma instância de PostgreSQL, o lado de leitura tem outra.

### O evento que liga tudo

Quando um voto chega no vote-service, é gravado no banco de escrita e publicado num tópico Kafka. O result-service consome esse evento, incrementa o contador no banco de leitura e evicta o cache Redis para aquela enquete. O evento é `VoteRegisteredEvent`.

Uma coisa que causou atrito no início: os três serviços precisavam compartilhar o esquema do evento. A solução foi um quarto módulo Maven — `shared/event-models` — compilado como JAR e instalado localmente. Cada serviço o declara como dependência. É um pouco burocrático para um projeto pequeno, mas espelha como isso funcionaria num sistema real com múltiplos times trabalhando em serviços diferentes.

### Por que duas instâncias de PostgreSQL

O banco de escrita tem um esquema normalizado. O banco de leitura armazena resultados pré-agregados por opção. Quando um novo voto chega, o result-service não executa nenhum join — apenas incrementa um contador em `poll_results` e serve o valor cacheado do Redis.

A evição do Redis acontece no nível certo: quando um `VoteRegisteredEvent` chega, o consumidor evicta o cache para aquele `pollId` específico. O próximo GET para essa enquete vai ao banco de leitura, recalcula, e coloca o valor atualizado de volta no cache. Cache-aside, direto ao ponto. Resultados de enquetes toleram uma janela breve de inconsistência eventual, então isso funciona bem aqui.

### Teste de carga com k6

Adicionei um teste de carga com k6 para ter algo concreto contra o qual rodar o sistema. Os thresholds — p95 de latência de voto abaixo de 500ms, p95 de latência de resultado abaixo de 200ms, taxa de erro abaixo de 1% — não são números arbitrários. São o tipo de meta que você realmente se importaria num contexto de votação em tempo real.

O script sobe até 50 virtual users, lança votos e lê resultados de forma concorrente. Rodar isso enquanto observa o `docker stats` dá uma imagem clara de onde estão os gargalos.

### Rodando localmente

A infraestrutura é totalmente Dockerizada: duas instâncias de PostgreSQL, Kafka com Zookeeper, Redis, tudo num único arquivo compose. Os serviços usam um perfil Spring `local` que troca os hostnames do nome da rede Docker para `localhost`, então você pode rodar os processos JVM fora do Docker mantendo os contêineres de infraestrutura ativos. Assim você tem reload rápido durante o desenvolvimento sem abrir mão das dependências reais.

### O que eu olharia a seguir

O setup atual de consumer groups não trata reinicializações do result-service de forma limpa. Quando ele volta, retoma de onde está o offset Kafka, o que pode pular eventos se o serviço ficou fora durante um burst. Armazenar o offset do consumidor junto ao estado do modelo de leitura deixaria a história de reprocessamento mais confiável. Essa é a lacuna mais significativa no design atual.
