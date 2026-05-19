export class InvalidVideoUrlForProviderError extends Error {
  constructor(public readonly details: string[]) {
    super(details.join(' '))
    this.name = 'InvalidVideoUrlForProviderError'
  }
}
