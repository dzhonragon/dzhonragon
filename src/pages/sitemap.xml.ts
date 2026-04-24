import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site, LOCALES } from "@/data/site";

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  const staticPaths = ["", "/projects", "/blog"];

  const urls: string[] = [];

  // Static pages for each locale
  for (const lang of LOCALES) {
    for (const path of staticPaths) {
      urls.push(`${site.url}/${lang}${path}`);
    }
  }

  // Blog posts
  for (const post of posts) {
    const [lang, ...slugParts] = post.slug.split("/");
    const slug = slugParts.join("/");
    urls.push(`${site.url}/${lang}/blog/${slug}`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
