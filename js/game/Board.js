import { createElement } from "../ui/dom.js";

export class Board {
  constructor(preset) {
    this.width = preset.width;
    this.height = preset.height;
    this.walls = new Set(preset.walls.map((wall) => this.createPositionKey(wall)));
    this.coins = new Set(preset.coins.map((coin) => this.createPositionKey(coin)));
    this.enemyStarts = new Set(preset.enemies.map((enemy) => this.createPositionKey(enemy.start)));
    this.lavaTrails = new Set();
    this.electricZones = new Set();
    this.playerStart = { ...preset.playerStart };
    this.element = null;
  }

  render() {
    const cells = [];

    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        cells.push(this.createCell({ x, y }));
      }
    }

    this.element = createElement("section", {
      className: "game-board mb-4",
      attributes: {
        "aria-label": "Plansza gry",
        "data-board-width": String(this.width)
      },
      children: cells
    });

    return this.element;
  }

  createCell(position) {
    const key = this.createPositionKey(position);
    const classes = ["board-cell"];
    let label = "Puste pole";

    if (this.walls.has(key)) {
      classes.push("board-cell-wall");
      label = "Ściana";
    } else if (this.coins.has(key)) {
      classes.push("board-cell-coin");
      label = "Moneta";
    } else if (this.enemyStarts.has(key)) {
      classes.push("board-cell-enemy");
      label = "Pozycja startowa przeciwnika";
    }

    if (this.createPositionKey(this.playerStart) === key) {
      classes.push("board-cell-player");
      label = "Gracz";
    }

    return createElement("div", {
      className: classes.join(" "),
      attributes: {
        "aria-label": label,
        "data-x": String(position.x),
        "data-y": String(position.y)
      }
    });
  }

  updatePlayerPosition(previousPosition, nextPosition) {
    this.getCell(previousPosition)?.classList.remove("board-cell-player");
    this.getCell(nextPosition)?.classList.add("board-cell-player");
  }

  updateEnemyPosition(previousPosition, nextPosition) {
    this.getCell(previousPosition)?.classList.remove("board-cell-enemy");
    this.getCell(nextPosition)?.classList.add("board-cell-enemy");
  }

  collectCoinAt(position) {
    const key = this.createPositionKey(position);

    if (!this.coins.has(key)) {
      return false;
    }

    this.coins.delete(key);

    const cell = this.getCell(position);

    if (cell) {
      cell.classList.remove("board-cell-coin");
      cell.setAttribute("aria-label", "Gracz");
    }

    return true;
  }

  hasCoinAt(position) {
    return this.coins.has(this.createPositionKey(position));
  }

  hasWallAt(position) {
    return this.walls.has(this.createPositionKey(position));
  }

  isInside({ x, y }) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  addLavaTrail(position) {
    const key = this.createPositionKey(position);
    this.lavaTrails.add(key);
    this.getCell(position)?.classList.add("board-cell-lava");
  }

  hasLavaTrailAt(position) {
    return this.lavaTrails.has(this.createPositionKey(position));
  }

  setElectricZones(positions) {
    positions.forEach((position) => {
      const key = this.createPositionKey(position);
      this.electricZones.add(key);
      this.getCell(position)?.classList.add("board-cell-electric");
    });
  }

  clearElectricZones() {
    this.electricZones.forEach((key) => {
      const [x, y] = key.split(":").map(Number);
      this.getCell({ x, y })?.classList.remove("board-cell-electric");
    });
    this.electricZones.clear();
  }

  hasElectricZoneAt(position) {
    return this.electricZones.has(this.createPositionKey(position));
  }

  getCell({ x, y }) {
    return this.element?.querySelector(`[data-x="${x}"][data-y="${y}"]`) || null;
  }

  createPositionKey({ x, y }) {
    return `${x}:${y}`;
  }
}
