import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { withDefaults } from '@docsmint/config'
import { toCollectionAwareContentId } from './domain/content/content-loader'
import rawSiteConfig from '../docsmint.config.ts'

const siteConfig = withDefaults(rawSiteConfig)

const docsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  order: z.number().optional(),
  search: z.boolean().optional(),
  published: z.boolean().optional().default(true),
  scheduled: z.coerce.date().optional(),
})

const writingSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  description: z.string().optional(),
  author: z.string().optional(),
  search: z.boolean().optional(),
  published: z.boolean().optional().default(true),
  scheduled: z.coerce.date().optional(),
})

const pageSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  search: z.boolean().optional(),
})

function schemaForKind(kind?: string) {
  if (kind === 'writing') {
    return writingSchema
  }
  if (kind === 'page') {
    return pageSchema
  }
  return docsSchema
}

export const collections = Object.fromEntries(
  Object.entries(siteConfig.collections ?? {}).map(([key, collection]) => [
    key,
    defineCollection({
      loader: glob({
        pattern: '**/*.{md,mdx}',
        base: `./src/content/${key}`,
        generateId: ({ entry }) => toCollectionAwareContentId(key, entry),
      }),
      schema: schemaForKind(collection.kind),
    }),
  ]),
)
