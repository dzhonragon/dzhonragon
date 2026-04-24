import { getCollection } from "astro:content";
import { LOCALES, type Lang } from "@/data/site";

export function getLocalePaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}

export function getLocaleSwitchPath(pathname: string, currentLang: Lang): string {
  const other = currentLang === "pt" ? "en" : "pt";
  return pathname.replace(`/${currentLang}`, `/${other}`);
}

export async function getLocalePosts(lang: Lang) {
  const all = await getCollection("blog", ({ data }) => !data.draft);
  return all
    .filter((p) => p.slug.startsWith(`${lang}/`))
    .map((p) => ({ ...p, slug: p.slug.replace(`${lang}/`, "") }))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
