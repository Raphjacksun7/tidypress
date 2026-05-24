import type {
  DocsMintConfig,
  DocsMintDocForm,
  ResolvedListDisplay,
} from '@docsmint/config'
import type { SiteRouteDefinition } from '@/routing/types'
import type { DocChapterNav } from '@/routing/chapter-nav'

export interface IndexEntryPreview {
  slug: string
  title: string
  href: string
  author?: string
  description?: string
  dateLabel?: string
  dateIso?: string
  icon?: string
  tags?: string[]
  external?: boolean
  status?: string
}

export interface RouteViewBundle {
  viewKey: string
  site: DocsMintConfig
  route: SiteRouteDefinition
  title: string
  description?: string
  headings: { depth: number; slug: string; text: string }[]
  pagefindIgnore?: boolean
  editPath?: string
  redirectTo?: string
  showPageTitle?: boolean
  collectionRootPath?: string
  firstDocHref?: string
  collectionDisplay?: ResolvedListDisplay
  indexEntries?: IndexEntryPreview[]
  localeHome?: {
    locale: string
    sections: {
      key: string
      title: string
      showDateInList: boolean
      showDescriptionInList: boolean
      items: {
        href: string
        title: string
        description?: string
        dateLabel?: string
        icon?: string
        tags?: string[]
      }[]
      moreHref?: string
      moreLabel?: string
      display: ResolvedListDisplay
    }[]
  }
  entryMeta?: {
    dateLabel?: string
    author?: string
    tags?: string[]
    readingTimeLabel?: string
    ogImage?: string
    docForm?: DocsMintDocForm
    formLabel?: string
    part?: string
    chapterNav?: DocChapterNav
    showChapterNavTop?: boolean
    showChapterNavBottom?: boolean
  }
}
