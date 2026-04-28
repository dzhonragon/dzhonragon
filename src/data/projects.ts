import type { Lang } from "./site";

export interface ProjectTranslation {
  title: string;
  description: string;
}

export interface Project {
  translations: Record<Lang, ProjectTranslation>;
  tech: string[];
  github: string;
  demo?: string;
  image?: string;
  featured?: boolean;
  blogSlug?: Partial<Record<Lang, string>>;
}

export const projects: Project[] = [
  {
    translations: {
      pt: {
        title: "tusk",
        description:
          "Uma linguagem de programação estaticamente tipada e experimental construída sobre Python, com inferência de tipos, funcionalidades de programação funcional, operador pipe e um pipeline de interpretação personalizado que inclui lexer, parser, AST, verificador de tipos e interpretador.",
      },
      en: {
        title: "tusk",
        description:
          "An experimental statically typed programming language built on top of Python with type inference, functional programming features, a pipe operator, and a custom interpreter pipeline including lexer, parser, AST, type checker, and interpreter.",
      },
    },
    tech: ["python", "lark"],
    github: "https://github.com/dzhonragon/tusk",
    featured: true,
    blogSlug: { pt: "tusk", en: "tusk" },
  },
  {
    translations: {
      pt: {
        title: "realtime-poll-system",
        description:
          "Sistema de microsserviços orientado a eventos com Spring Boot, demonstrando CQRS, mensageria com Kafka, cache com Redis e infraestrutura Dockerizada para enquetes em tempo real e cargas de trabalho de alta throughput.",
      },
      en: {
        title: "realtime-poll-system",
        description:
          "Event-driven Spring Boot microservices system demonstrating CQRS, Kafka messaging, Redis caching, and Dockerized infrastructure for scalable real-time polling and high-throughput backend workloads.",
      },
    },
    tech: ["java", "spring boot", "kafka", "redis", "docker"],
    github: "https://github.com/dzhonragon/realtime-poll-system",
    featured: true,
    blogSlug: { pt: "realtime-poll-system", en: "realtime-poll-system" },
  },
  {
    translations: {
      pt: {
        title: "4less",
        description:
          "Um compilador pequeno que transforma uma sintaxe concisa baseada em indentação em HTML válido. A gramática ANTLR4 é a única fonte de verdade; o lexer e o parser são gerados a partir dela. Um visitor Node.js caminha pela árvore e emite strings HTML.",
      },
      en: {
        title: "4less",
        description:
          "A small compiler that turns a concise indentation-based syntax into valid HTML. The ANTLR4 grammar is the single source of truth; the lexer and parser are generated from it. A Node.js visitor walks the parse tree and emits HTML strings.",
      },
    },
    tech: ["nodejs", "antlr4", "javascript"],
    github: "https://github.com/dzhonragon/4less",
    featured: true,
    blogSlug: { pt: "4less", en: "4less" },
  },
  {
    translations: {
      pt: {
        title: "relations",
        description:
          "API de recomendação de amizade que usa MongoDB para dados de usuário e Neo4j para o grafo de relacionamentos. Uma única query Cypher de três linhas percorre amigos de amigos. O Spring Boot gerencia o ciclo de vida dos bancos via Docker Compose.",
      },
      en: {
        title: "relations",
        description:
          "Friend recommendation API using MongoDB for user documents and Neo4j for the relationship graph. A three-line Cypher query traverses friends-of-friends. Spring Boot manages the database lifecycle via Docker Compose.",
      },
    },
    tech: ["java", "spring boot", "neo4j", "mongodb"],
    github: "https://github.com/dzhonragon/relations",
    featured: false,
    blogSlug: { pt: "relations", en: "relations" },
  },
  {
    translations: {
      pt: {
        title: "python-and-golang-integration-with-rabbitmq",
        description:
          "Produtor Python e consumidor Go trocando mensagens JSON por uma fila RabbitMQ. O consumidor usa ack manual para garantir que mensagens não sejam descartadas em caso de falha. A imagem Docker do Go usa build multi-stage com base scratch.",
      },
      en: {
        title: "python-and-golang-integration-with-rabbitmq",
        description:
          "Python producer and Go consumer exchanging JSON messages over a RabbitMQ queue. The consumer uses manual acknowledgement so messages are not dropped on failure. The Go Docker image uses a multi-stage build with a scratch base.",
      },
    },
    tech: ["python", "golang", "rabbitmq", "docker"],
    github: "https://github.com/dzhonragon/python-and-golang-integration-with-rabbitmq",
    featured: false,
    blogSlug: { pt: "python-golang-rabbitmq", en: "python-golang-rabbitmq" },
  },
  {
    translations: {
      pt: {
        title: "dzhonragon",
        description:
          "Repositório de perfil do GitHub. Um README em markdown que serve como apresentação pública — o que faço, links para os projetos que melhor representam meu trabalho e uma nota sobre o que estou focado.",
      },
      en: {
        title: "dzhonragon",
        description:
          "GitHub profile repository. A markdown README serving as a public introduction — what I do, links to the projects that best represent my work, and a note on what I'm currently focused on.",
      },
    },
    tech: ["markdown"],
    github: "https://github.com/dzhonragon/dzhonragon",
    featured: false,
  },
];
