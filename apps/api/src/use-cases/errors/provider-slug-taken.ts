export class ProviderSlugTakenError extends Error {
  constructor() {
    super('Slug do provedor já está em uso.')
    this.name = 'ProviderSlugTakenError'
  }
}
