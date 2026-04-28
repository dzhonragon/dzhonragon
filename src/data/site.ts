export const LOCALES = ["pt", "en"] as const;
export type Lang = (typeof LOCALES)[number];

export const site = {
  name: "dzhonragon",
  fullName: "João Victor V. Fernandes",
  url: "https://dzhonragon.com",
  defaultDescription: {
    pt: "Ensaios do Dzhon: perspectivas interessantes.",
    en: "Dzhon's Essays: Interesting Insights.",
  },
  description: {
    pt: "Trabalho como programador, e uma noite percebi que precisava de um site pessoal. Não sou exatamente alguém que ama escrever, mas quero compartilhar ideias e mostrar o que construo.",
    en: "I work as a programmer, and one night I realized I needed a personal website. I'm not exactly someone who loves writing, but I'd like to share my ideas and showcase my projects here.",
  },
  socials: [
    {
      href: "https://github.com/dzhonragon",
      label: "GitHub",
      icon: "github",
    },
    {
      href: "https://www.linkedin.com/in/joao-victor-vasconcelos-fernandes/",
      label: "LinkedIn",
      icon: "linkedin",
    },
    {
      href: "mailto:hello@dzhonragon.com",
      label: "Email",
      icon: "email",
    },
  ],
};

export const ui = {
  pt: {
    switchLang: "English",
    back: "← início",
    postBack: "← escrita",
    hero: {
      greeting: "olá, eu sou",
      projects: "projetos",
      blog: "escrita",
    },
    projects: {
      heading: "Projetos",
      lead: "coisas que construí",
      empty: "nada aqui ainda.",
      details: "detalhes →",
      readPost: "ler post →",
    },
    blog: {
      heading: "Escrita",
      lead: "ideias que valem registrar",
      empty: "nada aqui ainda.",
    },
    post: {
      readMore: "ler →",
      all: "todos →",
    },
    actions: {
      github: "GitHub",
      demo: "Demo",
      close: "fechar",
      viewGithub: "ver no GitHub",
      share: "compartilhar",
      copyLink: "copiar link",
      copied: "copiado!",
    },
  },
  en: {
    switchLang: "Português",
    back: "← home",
    postBack: "← writing",
    hero: {
      greeting: "hey, I'm",
      projects: "projects",
      blog: "writing",
    },
    projects: {
      heading: "Projects",
      lead: "things I've built",
      empty: "nothing here yet.",
      details: "details →",
      readPost: "read post →",
    },
    blog: {
      heading: "Writing",
      lead: "ideas worth putting down",
      empty: "nothing here yet.",
    },
    post: {
      readMore: "read →",
      all: "all →",
    },
    actions: {
      github: "GitHub",
      demo: "Demo",
      close: "close",
      viewGithub: "view on GitHub",
      share: "share",
      copyLink: "copy link",
      copied: "copied!",
    },
  },
};

export function t(lang: Lang) {
  return ui[lang];
}
