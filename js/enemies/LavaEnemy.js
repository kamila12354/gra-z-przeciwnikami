import { Enemy } from "./Enemy.js";

export class LavaEnemy extends Enemy {
  constructor(config) {
    super({
      ...config,
      type: "lava"
    });
  }

  move({ collisionService, playerPosition }) {
    const previousPosition = this.getPosition();//zapetlenie starej pozycji
    const shouldChase = Math.random() <= Math.min(this.intelligence / 12, 0.75);//czy bedzie gonil gracza
    let nextPosition = this.chooseRandomMove(collisionService);

    if (shouldChase) {
      const moves = this.getAvailableMoves(collisionService);//pobiera dostepne ruchy
      const closestMove = moves
        .map((position) => ({
          position,
          distance: this.calculateDistance(position, playerPosition)
        }))
        .sort((first, second) => first.distance - second.distance)[0];

      if (closestMove) {//zabezpiecza jezeli lista byala by pusta
        nextPosition = closestMove.position;//wybiera najlepszy ruch
      }
    }

    this.setPosition(nextPosition);

    return {
      nextPosition,
      lavaTrail: previousPosition//poprzednia pozycja tu zostaje lawa
    };
  }
}

