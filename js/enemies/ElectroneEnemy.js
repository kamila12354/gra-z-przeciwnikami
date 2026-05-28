import { Enemy } from "./Enemy.js";

export class ElectroneEnemy extends Enemy {
  constructor(config) {
    super({
      ...config,
      type: "electrone"
    });
    this.charge = 0;
  }

  update({ board, collisionService, playerPosition }) {
    this.charge += 1;

    const shouldMove = this.charge % Math.max(2, 6 - this.speed) === 0;

    if (shouldMove) {
      this.setPosition(this.chooseRandomMove(collisionService));
    }

    const range = Math.min(Math.max(this.intelligence, 2), 6);
    const isPlayerInRange = this.calculateDistance(this.position, playerPosition) <= range;

    return {
      nextPosition: this.getPosition(),
      electricZones: isPlayerInRange ? this.createElectricZones(board, range) : []
    };
  }

  createElectricZones(board, range) {
    const zones = [];

    for (let offset = -range; offset <= range; offset += 1) {
      const horizontal = { x: this.position.x + offset, y: this.position.y };
      const vertical = { x: this.position.x, y: this.position.y + offset };

      if (board.isInside(horizontal) && !board.hasWallAt(horizontal)) {
        zones.push(horizontal);
      }

      if (board.isInside(vertical) && !board.hasWallAt(vertical)) {
        zones.push(vertical);
      }
    }

    return zones;
  }
}

