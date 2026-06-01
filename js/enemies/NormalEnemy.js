import { Enemy } from "./Enemy.js";

export class NormalEnemy extends Enemy {
  constructor(config) {
    super({
      ...config,
      type: "normal"
    });
  }

  move({ collisionService, playerPosition }) {
    //metoda ruchu system kolizji , pozycja gracza
    const moves = this.getAvailableMoves(collisionService);//pobiera ruchy
    //czy cos nie prowadzi do sciany i odrzuca takie ruchy
    if (moves.length === 0) {//jesli nie moze sie ruszyc jezeli przeciwnik zablokowany
      return { nextPosition: this.getPosition() };//zostaje w mijescu
    }

    const bestMove = moves //szukanie najlpeszego ruchu
      .map((position) => ({
        position,
        distance: this.calculateDistance(position, playerPosition) // Odległość od gracza po wykonaniu ruchu
      }))
      .sort((first, second) => first.distance - second.distance)[0].position;
      //sortuje ruchy od najmijszej odleglosci

    const shouldChase = Math.random() <= Math.min(this.intelligence / 10, 0.95);
    const nextPosition = shouldChase ? bestMove : this.chooseRandomMove(collisionService);//jesli sciga najlepszy ruch przeciwnie losowo
    this.setPosition(nextPosition);

    return { nextPosition };
  }
}

