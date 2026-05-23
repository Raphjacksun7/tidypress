import type { ICollection, CollectionPresentationTarget } from '@/collections/ICollection'

export class PresentationRegistry {
  constructor(private readonly presentations: ICollection[]) {}

  resolve(target: CollectionPresentationTarget): ICollection {
    const presentation = this.presentations.find(candidate => candidate.presentationTarget === target)
    if (!presentation) {
      throw new Error(`No collection presentation registered for "${target}".`)
    }
    return presentation
  }
}
