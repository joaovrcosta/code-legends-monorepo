export class CannotModifyBuiltinProviderError extends Error {
  constructor(message = 'Provedor built-in não permite esta operação.') {
    super(message)
    this.name = 'CannotModifyBuiltinProviderError'
  }
}
