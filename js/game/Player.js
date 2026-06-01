export class Player {
  constructor(startPosition) {
    this.position = { ...startPosition };
  }

  getPosition() {
    return { ...this.position };//przyklad niemutowane strukttury danych tworzy kopie obiektu
  }

  moveTo(position) {
    this.position = { ...position };
  }
}

