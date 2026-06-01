export class Enemy {
  constructor(config) {
    this.id = config.id || crypto.randomUUID(); // unikalny identyfikator przeciwnika
    this.type = config.type; // typ przeciwnika
    this.speed = Number(config.speed) || 1; // szybkość przeciwnika
    this.intelligence = Number(config.intelligence) || 1; // poziom inteligencji
    this.position = { ...config.start }; // pozycja startowa
    this.energy = 0; // energia potrzebna do wykonania ruchu
  }

  update(context) {
    // główna metoda aktualizacji przeciwnika
    return this.move(context);
  }

  move() {
    // domyślna implementacja ruchu
    return {
      nextPosition: this.getPosition()
    };
  }

  getPosition() {
    // zwraca kopię aktualnej pozycji
    return { ...this.position };
  }

  setPosition(position) {
    // ustawia nową pozycję przeciwnika
    this.position = { ...position };
  }

  canAct() {
    // zwiększa energię w zależności od szybkości
    this.energy += Math.max(this.speed, 1);

    // jeśli energii jest za mało, przeciwnik nie może wykonać ruchu
    if (this.energy < 3) {
      return false;
    }

    // po wykonaniu ruchu energia jest zerowana
    this.energy = 0;
    return true;
  }

  getAvailableMoves(collisionService) {
    // możliwe kierunki ruchu
    const directions = [
      { x: 0, y: -1 }, // góra
      { x: 1, y: 0 },  // prawo
      { x: 0, y: 1 },  // dół
      { x: -1, y: 0 }  // lewo
    ];

    return directions
        .map((direction) => ({
          // wyznaczenie nowych współrzędnych
          x: this.position.x + direction.x,
          y: this.position.y + direction.y
        }))
        .filter((position) =>
            // pozostawia tylko pola, na które można wejść
            collisionService.canMoveTo(position)
        );
  }

  chooseRandomMove(collisionService) {
    // pobiera wszystkie dostępne ruchy
    const moves = this.getAvailableMoves(collisionService);

    // jeśli brak możliwych ruchów, pozostaje w miejscu
    if (moves.length === 0) {
      return this.getPosition();
    }

    // losuje jeden z dostępnych ruchów
    return moves[Math.floor(Math.random() * moves.length)];
  }

  calculateDistance(firstPosition, secondPosition) {
    // oblicza odległość Manhattan między dwoma punktami
    return (
        Math.abs(firstPosition.x - secondPosition.x) +
        Math.abs(firstPosition.y - secondPosition.y)
    );
  }
}