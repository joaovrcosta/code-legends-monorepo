export class VideoProviderNotFoundError extends Error {
  constructor() {
    super('Provedor de vídeo não encontrado.')
    this.name = 'VideoProviderNotFoundError'
  }
}
