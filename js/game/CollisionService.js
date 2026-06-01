export class CollisionService {

  constructor(board) {
    // Referencja do planszy, na której wykonywane są sprawdzenia
    this.board = board;
  }

  canMoveTo(position) {
    // Sprawdza, czy obiekt może wejść na wskazane pole.
    // Pole musi znajdować się w granicach planszy
    // i nie może zawierać ściany.
    return this.isInsideBoard(position) && !this.isWall(position);
  }

  isInsideBoard({ x, y }) {
    // Weryfikacja czy współrzędne znajdują się
    // w dozwolonym obszarze planszy
    return x >= 0 && y >= 0 &&
        x < this.board.width &&
        y < this.board.height;
  }

  isWall(position) {
    // Delegowanie sprawdzenia ściany do klasy Board
    return this.board.hasWallAt(position);
  }
}