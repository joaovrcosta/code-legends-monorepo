export class CareerFinalExamRequestInvalidError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CareerFinalExamRequestInvalidError'
  }
}
