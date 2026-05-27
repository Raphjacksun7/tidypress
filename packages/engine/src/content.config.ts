import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import {
  collectionKindContentSchema,
  tidyPressDocsPagingModes,
  tidyPressDocFormSchema,
  defaultTidyPressDocForm,
  isDocsCollectionKey,
  isTidyPressCollectionKind,
  isTidyPressDocForm,
  withDefaults,
} from '@tidypress/config'
import { toCollectionAwareContentId } from '@/utils/content-loader'
import rawSiteConfig from '@site-config'

const siteConfig = withDefaults(rawSiteConfig)

const enginePackageRoot = path.resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '..',
)
const projectRoot = process.env.TIDYPRESS_PROJECT_ROOT ?? enginePackageRoot

function collectionContentBase(collectionKey: string) {
  const absolute = path.join(projectRoot, 'src/content', collectionKey)
  if (process.env.TIDYPRESS_PROJECT_ROOT) {
    return pathToFileURL(`${absolute}/`)
  }
  return `./src/content/${collectionKey}`
}

const customDocFormKeys = Object.keys(siteConfig.extensions?.docForms ?? {}).filter(
  key => !isTidyPressDocForm(key),
)
const docsFormSchema =
  customDocFormKeys.length > 0
    ? z.union([
        z.enum(tidyPressDocFormSchema),
        z.enum(customDocFormKeys as [string, ...string[]]),
      ])
    : z.enum(tidyPressDocFormSchema)

const docsSchema = z.object({
  title: z.string(),
  form: docsFormSchema.default(defaultTidyPressDocForm),
  description: z.string().optional(),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().optional(),
  paging: z.union([z.boolean(), z.enum(tidyPressDocsPagingModes)]).optional(),
  search: z.boolean().optional(),
  published: z.boolean().optional().default(true),
  scheduled: z.coerce.date().optional(),
})

const writingSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  description: z.string().optional(),
  author: z.string().optional(),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  ogImage: z.string().optional(),
  search: z.boolean().optional(),
  published: z.boolean().optional().default(true),
  scheduled: z.coerce.date().optional(),
})

const projectsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  url: z.string().optional(),
  repo: z.string().optional(),
  status: z.string().optional(),
  featured: z.boolean().optional(),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),
  linkOnly: z.boolean().optional(),
  search: z.boolean().optional(),
  published: z.boolean().optional().default(true),
})

const pageSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  search: z.boolean().optional(),
})

const schemasByContentSchema = {
  docs: docsSchema,
  writing: writingSchema,
  page: pageSchema,
  projects: projectsSchema,
} as const

function schemaForCollection(key: string, kind?: string) {
  if (isDocsCollectionKey(key)) {
    return docsSchema
  }
  if (isTidyPressCollectionKind(kind)) {
    return schemasByContentSchema[collectionKindContentSchema(kind)]
  }
  return docsSchema
}

export const collections = Object.fromEntries(
  Object.entries(siteConfig.collections ?? {}).map(([key, collection]) => [
    key,
    defineCollection({
      loader: glob({
        pattern: '**/*.{md,mdx}',
        base: collectionContentBase(key),
        generateId: ({ entry }) => toCollectionAwareContentId(key, entry),
      }),
      schema: schemaForCollection(key, collection.kind),
    }),
  ]),
)
