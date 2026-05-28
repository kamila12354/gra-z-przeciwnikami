import { Enemy } from "./Enemy.js";

export class NormalEnemy extends Enemy {
  constructor(config) {
    super({
      ...config,
      type: "normal"
    });
  }

  move({ collisionService, playerPosition }) {
    const moves = this.getAvailableMoves(collisionService);

    if (moves.length === 0) {
      return { nextPosition: this.getPosition() };
    }

    const bestMove = moves
      .map((position) => ({
        position,
        distance: this.calculateDistance(position, playerPosition)
      }))
      .sort((first, second) => first.distance - second.distance)[0].position;

    const shouldChase = Math.random() <= Math.min(this.intelligence / 10, 0.95);
    const nextPosition = shouldChase ? bestMove : this.chooseRandomMove(collisionService);
    this.setPosition(nextPosition);

    return { nextPosition };
  }
}

