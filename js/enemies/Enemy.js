export class Enemy {
  constructor(config) {
    this.id = config.id || crypto.randomUUID();
    this.type = config.type;
    this.speed = Number(config.speed) || 1;
    this.intelligence = Number(config.intelligence) || 1;
    this.position = { ...config.start };
    this.energy = 0;
  }

  update(context) {
    return this.move(context);
  }

  move() {
    return {
      nextPosition: this.getPosition()
    };
  }

  getPosition() {
    return { ...this.position };
  }

  setPosition(position) {
    this.position = { ...position };
  }

  canAct() {
    this.energy += Math.max(this.speed, 1);

    if (this.energy < 3) {
      return false;
    }

    this.energy = 0;
    return true;
  }

  getAvailableMoves(collisionService) {
    const directions = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 }
    ];

    return directions
      .map((direction) => ({
        x: this.position.x + direction.x,
        y: this.position.y + direction.y
      }))
      .filter((position) => collisionService.canMoveTo(position));
  }

  chooseRandomMove(collisionService) {
    const moves = this.getAvailableMoves(collisionService);

    if (moves.length === 0) {
      return this.getPosition();
    }

    return moves[Math.floor(Math.random() * moves.length)];
  }

  calculateDistance(firstPosition, secondPosition) {
    return Math.abs(firstPosition.x - secondPosition.x) + Math.abs(firstPosition.y - secondPosition.y);
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      speed: this.speed,
      intelligence: this.intelligence,
      start: this.getPosition()
    };
  }
}
