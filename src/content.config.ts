import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const guide = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/guide" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(["concrete", "roofing", "paint", "tile", "flooring", "general"]),
    author: z.string().default("HomeProjectHub Team"),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { guide };
