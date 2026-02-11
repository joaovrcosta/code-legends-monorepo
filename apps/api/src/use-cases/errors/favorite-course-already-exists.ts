export class FavoriteCourseAlreadyExistsError extends Error {
  constructor() {
    super("Favorite course already exists");
  }
}

