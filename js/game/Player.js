export class Player {
  constructor(startPosition) {
    // Ustawienie pozycji startowej gracza
    this.position = { ...startPosition };
  }

  getPosition() {
    return { ...this.position };//przyklad niemutowane strukttury danych tworzy kopie aktualnej pozycji gracza
  }

  moveTo(position) {// Aktualizacja pozycji gracza
    this.position = { ...position };
  }
}

