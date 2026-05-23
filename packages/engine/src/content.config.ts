import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import {
  collectionKindContentSchema,
  docsMintDocsPagingModes,
  docsMintDocFormSchema,
  defaultDocsMintDocForm,
  isDocsCollectionKey,
  isDocsMintCollectionKind,
  isDocsMintDocForm,
  withDefaults,
} from '@docsmint/config'
import { toCollectionAwareContentId } from '@/utils/content-loader'
import rawSiteConfig from '@site-config'

const siteConfig = withDefaults(rawSiteConfig)

const customDocFormKeys = Object.keys(siteConfig.extensions?.docForms ?? {}).filter(
  key => !isDocsMintDocForm(key),
)
const docsFormSchema =
  customDocFormKeys.length > 0
    ? z.union([
        z.enum(docsMintDocFormSchema),
        z.enum(customDocFormKeys as [string, ...string[]]),
      ])
    : z.enum(docsMintDocFormSchema)

const docsSchema = z.object({
  title: z.string(),
  /** Documentation form inside the `docs` collection — not a folder name or collection `kind`. */
  form: docsFormSchema.default(defaultDocsMintDocForm),
  description: z.string().optional(),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().optional(),
  paging: z.union([z.boolean(), z.enum(docsMintDocsPagingModes)]).optional(),
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
  search: z.boolean().optional(),
  published: z.boolean().optional().default(true),
  scheduled: z.coerce.date().optional(),
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
} as const

function schemaForCollection(key: string, kind?: string) {
  if (isDocsCollectionKey(key)) {
    return docsSchema
  }
  if (isDocsMintCollectionKind(kind)) {
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
        base: `./src/content/${key}`,
        generateId: ({ entry }) => toCollectionAwareContentId(key, entry),
      }),
      schema: schemaForCollection(key, collection.kind),
    }),
  ]),
)
