import { Enemy } from "./Enemy.js";

export class LavaEnemy extends Enemy {
  constructor(config) {
    super({
      ...config,
      type: "lava"
    });
  }

  move({ collisionService, playerPosition }) {
    const previousPosition = this.getPosition();
    const shouldChase = Math.random() <= Math.min(this.intelligence / 12, 0.75);
    let nextPosition = this.chooseRandomMove(collisionService);

    if (shouldChase) {
      const moves = this.getAvailableMoves(collisionService);
      const closestMove = moves
        .map((position) => ({
          position,
          distance: this.calculateDistance(position, playerPosition)
        }))
        .sort((first, second) => first.distance - second.distance)[0];

      if (closestMove) {
        nextPosition = closestMove.position;
      }
    }

    this.setPosition(nextPosition);

    return {
      nextPosition,
      lavaTrail: previousPosition
    };
  }
}

