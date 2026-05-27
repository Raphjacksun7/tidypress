import fs from 'node:fs'
import path from 'node:path'
import {
  collectionKindModeRequiresRenderedEntry,
  collectionKindRouteModes,
  collectionKindShellLayout,
  tidyPressDocFormViewConfig,
  resolveCollectionKind,
} from '../registry/collection-kinds.js'
import { isTidyPressDocForm } from '../registry/doc-forms.js'
import { isDocsCollectionKey } from '../registry/legacy.js'
import type { CollectionRouteViewMode } from '../registry/collection-kinds.js'
import type { TidyPressConfig } from '../schema/index.js'

export interface PluginManifest {
  viewDescriptors: Array<{
    viewKey: string
    requiresRenderedEntry: boolean
    shell: boolean
  }>
  shellLayoutByPrefix: Record<string, 'docs' | 'writing' | 'page'>
  presentationModules: Record<string, string>
  astroViewImports: Record<string, string>
  docFormKeys: string[]
}

export interface CollectPluginManifestOptions {
  /** Docs project root — when set, only existing Astro view files are registered. */
  projectRoot?: string
}

function astroViewFileExists(projectRoot: string | undefined, relativePath: string): boolean {
  if (!projectRoot) {
    return true
  }
  const absolute = path.resolve(projectRoot, relativePath.replace(/^\.\//, ''))
  return fs.existsSync(absolute)
}

function registerAstroViewImport(
  astroViewImports: Record<string, string>,
  projectRoot: string | undefined,
  viewKey: string,
  viewsDir: string,
  mode: string,
): void {
  const joined = path.posix.join(viewsDir.replace(/\/$/, ''), `${mode}.astro`)
  const astroPath = joined.startsWith('./') ? joined : `./${joined}`
  if (!astroViewFileExists(projectRoot, astroPath)) {
    return
  }
  astroViewImports[viewKey] = astroPath
}

function registerCollectionViews(options: {
  prefix: string
  kind: ReturnType<typeof resolveCollectionKind>
  modes: CollectionRouteViewMode[]
  shellLayout: ReturnType<typeof collectionKindShellLayout>
  render: NonNullable<NonNullable<TidyPressConfig['collections']>[string]['render']>
  projectRoot: string | undefined
  viewDescriptors: PluginManifest['viewDescriptors']
  shellLayoutByPrefix: PluginManifest['shellLayoutByPrefix']
  presentationModules: Record<string, string>
  astroViewImports: Record<string, string>
}): void {
  const {
    prefix,
    kind,
    modes,
    shellLayout,
    render,
    projectRoot,
    viewDescriptors,
    shellLayoutByPrefix,
    presentationModules,
    astroViewImports,
  } = options

  shellLayoutByPrefix[prefix] = shellLayout

  for (const mode of modes) {
    viewDescriptors.push({
      viewKey: `${prefix}:${mode}`,
      requiresRenderedEntry: collectionKindModeRequiresRenderedEntry(kind, mode),
      shell: true,
    })
  }

  if (render.presentation) {
    presentationModules[prefix] = render.presentation
  }
  if (render.views) {
    for (const mode of modes) {
      registerAstroViewImport(astroViewImports, projectRoot, `${prefix}:${mode}`, render.views, mode)
    }
  }
}

/** @param site Config after `withDefaults()`. */
export function collectPluginManifest(
  site: TidyPressConfig,
  options: CollectPluginManifestOptions = {},
): PluginManifest {
  const { projectRoot } = options
  const collections = site.collections ?? {}
  const viewDescriptors: PluginManifest['viewDescriptors'] = []
  const shellLayoutByPrefix: PluginManifest['shellLayoutByPrefix'] = {}
  const presentationModules: Record<string, string> = {}
  const astroViewImports: Record<string, string> = {}
  const docFormKeys: string[] = []

  for (const [collectionKey, collection] of Object.entries(collections)) {
    if (!collection?.enabled || isDocsCollectionKey(collectionKey)) {
      continue
    }
    const render = collection.render
    if (!render?.presentation && !render?.views) {
      continue
    }
    const kind = resolveCollectionKind(collection.kind)
    registerCollectionViews({
      prefix: collectionKey,
      kind,
      modes: collectionKindRouteModes(kind),
      shellLayout: collectionKindShellLayout(kind),
      render,
      projectRoot,
      viewDescriptors,
      shellLayoutByPrefix,
      presentationModules,
      astroViewImports,
    })
  }

  const docForms = site.extensions?.docForms ?? {}
  const docFormShell = tidyPressDocFormViewConfig.shellLayout
  const docFormModes = Object.keys(tidyPressDocFormViewConfig.routeModes) as CollectionRouteViewMode[]

  for (const [formKey, descriptor] of Object.entries(docForms)) {
    if (isTidyPressDocForm(formKey)) {
      continue
    }
    docFormKeys.push(formKey)
    const formPrefix = `form-${formKey}`
    shellLayoutByPrefix[formPrefix] = docFormShell

    for (const mode of docFormModes) {
      viewDescriptors.push({
        viewKey: `${formPrefix}:${mode}`,
        requiresRenderedEntry: tidyPressDocFormViewConfig.routeModes[mode].requiresRenderedEntry,
        shell: true,
      })
      if (descriptor.views) {
        registerAstroViewImport(astroViewImports, projectRoot, `${formPrefix}:${mode}`, descriptor.views, mode)
      }
    }
    if (descriptor.presentation) {
      presentationModules[`form:${formKey}`] = descriptor.presentation
    }
  }

  return {
    viewDescriptors,
    shellLayoutByPrefix,
    presentationModules,
    astroViewImports,
    docFormKeys,
  }
}

export function formatPluginManifestModule(manifest: PluginManifest): string {
  return `// Generated by tidypress — do not edit.
export const PLUGIN_ROUTE_VIEW_DESCRIPTORS = ${JSON.stringify(manifest.viewDescriptors, null, 2)}

export const PLUGIN_SHELL_LAYOUT_BY_PREFIX = ${JSON.stringify(manifest.shellLayoutByPrefix, null, 2)}

export const PLUGIN_PRESENTATION_MODULES = ${JSON.stringify(manifest.presentationModules, null, 2)}

export const PLUGIN_ASTRO_VIEW_IMPORTS = ${JSON.stringify(manifest.astroViewImports, null, 2)}

export const PLUGIN_DOC_FORM_KEYS = ${JSON.stringify(manifest.docFormKeys, null, 2)}
`
}

export function collectPluginPathsToMount(manifest: PluginManifest): Set<string> {
  const pathsToMount = new Set<string>()
  for (const relativePath of [
    ...Object.values(manifest.presentationModules),
    ...Object.values(manifest.astroViewImports),
  ]) {
    const normalized = relativePath.replace(/^\.\//, '')
    const top = normalized.split('/')[0]
    if (top) {
      pathsToMount.add(top)
    }
  }
  return pathsToMount
}
