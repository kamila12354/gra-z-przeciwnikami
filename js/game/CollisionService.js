export class CollisionService {
  constructor(board) {
    this.board = board;
  }

  canMoveTo(position) {
    return this.isInsideBoard(position) && !this.isWall(position);
  }

  isInsideBoard({ x, y }) {
    return x >= 0 && y >= 0 && x < this.board.width && y < this.board.height;
  }

  isWall(position) {
    return this.board.hasWallAt(position);
  }
}

