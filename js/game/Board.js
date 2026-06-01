import { createElement } from "../ui/dom.js";

export class Board {
  constructor(preset) {
    this.width = preset.width;
    this.height = preset.height;
    this.walls = new Set(preset.walls.map((wall) => this.createPositionKey(wall)));//przyklad map()przechodzi po scianach i tworzy nowa tablice kluczy
    this.coins = new Set(preset.coins.map((coin) => this.createPositionKey(coin)));
    this.enemyStarts = new Set(preset.enemies.map((enemy) => this.createPositionKey(enemy.start)));
    this.lavaTrails = new Set();
    this.electricZones = new Set();
    this.playerStart = { ...preset.playerStart };
    this.element = null;
  }

  render() {//rusuje cala plansze
    const cells = [];

    for (let y = 0; y < this.height; y += 1) {//po wierszach
      for (let x = 0; x < this.width; x += 1) {//po kolumnach
        cells.push(this.createCell({ x, y }));//tworzy i dodaje pojedyncze pola
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
    this.getCell(nextPosition)?.classList.add("board-cell-player");//usuwa klasy css
  }

  updateEnemyPosition(previousPosition, nextPosition) {
    this.getCell(previousPosition)?.classList.remove("board-cell-enemy");
    this.getCell(nextPosition)?.classList.add("board-cell-enemy");
  }

  collectCoinAt(position) {//zbiera monete z pola
    const key = this.createPositionKey(position);

    if (!this.coins.has(key)) {
      return false;
    }

    this.coins.delete(key);

    const cell = this.getCell(position);

    if (cell) {//sprawdza czy pole istnieje
      cell.classList.remove("board-cell-coin");//usuwa wyglad monety
      cell.setAttribute("aria-label", "Gracz");// aktualizuje  opis pola
    }

    return true;//informuje o zbieraniu monety
  }

  hasWallAt(position) {//czy na polu sciana
    return this.walls.has(this.createPositionKey(position));
  }

  isInside({ x, y }) {//czy pozycja miesci sie na planszy
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  addLavaTrail(position) {//dodaje pole lawy
    const key = this.createPositionKey(position);
    this.lavaTrails.add(key);
    this.getCell(position)?.classList.add("board-cell-lava");
  }

  hasLavaTrailAt(position) {//czy na polu jest lawa
    return this.lavaTrails.has(this.createPositionKey(position));
  }

  setElectricZones(positions) {//dodaje pole elektryczne
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

  createPositionKey({ x, y }) {//zmienia wspolrzedne na tekstowy klucz
    return `${x}:${y}`;
  }
}
