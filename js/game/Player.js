export class Player {
  constructor(startPosition) {
    this.position = { ...startPosition };
  }

  getPosition() {
    return { ...this.position };
  }

  moveTo(position) {
    this.position = { ...position };
  }
}

