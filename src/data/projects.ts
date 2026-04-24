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
  },
];
