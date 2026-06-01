import { Enemy } from "./Enemy.js";

export class LavaEnemy extends Enemy {
  constructor(config) {
    super({
      ...config,
      type: "lava" // ustawienie typu przeciwnika na lava
    });
  }

  move({ collisionService, playerPosition }) {

    // zapamiętanie poprzedniej pozycji,
    // aby po ruchu zostawić na niej ślad lawy
    const previousPosition = this.getPosition();

    // określa czy przeciwnik będzie ścigał gracza
    // szansa zależy od inteligencji, maksymalnie 75%
    const shouldChase =
        Math.random() <= Math.min(this.intelligence / 12, 0.75);

    // domyślnie wybierany jest losowy ruch
    let nextPosition = this.chooseRandomMove(collisionService);

    if (shouldChase) {

      // pobranie wszystkich możliwych ruchów
      const moves = this.getAvailableMoves(collisionService);

      // znalezienie ruchu, który najbardziej zbliża przeciwnika do gracza
      const closestMove = moves
          .map((position) => ({
            position,
            distance: this.calculateDistance(position, playerPosition)
          }))
          .sort((first, second) => first.distance - second.distance)[0];

      // zabezpieczenie przed pustą listą ruchów
      if (closestMove) {

        // wybór najlepszego ruchu
        nextPosition = closestMove.position;
      }
    }

    // aktualizacja pozycji przeciwnika
    this.setPosition(nextPosition);

    return {
      // nowa pozycja przeciwnika
      nextPosition,

      // na poprzednim polu pozostaje lawa
      lavaTrail: previousPosition
    };
  }
}