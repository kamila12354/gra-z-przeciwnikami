import { createElement } from "../ui/dom.js";

export class Board {
  constructor(preset) {
    // Inicjalizacja parametrów planszy na podstawie wybranego presetu
    this.width = preset.width;
    this.height = preset.height;

    // Przechowywanie ścian, monet i pozycji startowych przeciwników
    // w strukturze Set dla szybkiego wyszukiwania elementów
    this.walls = new Set(
        preset.walls.map((wall) => this.createPositionKey(wall))
    );

    this.coins = new Set(
        preset.coins.map((coin) => this.createPositionKey(coin))
    );

    this.enemyStarts = new Set(
        preset.enemies.map((enemy) => this.createPositionKey(enemy.start))
    );

    // Dynamiczne przeszkody i zagrożenia tworzone podczas gry
    this.lavaTrails = new Set();
    this.electricZones = new Set();

    // Pozycja startowa gracza
    this.playerStart = { ...preset.playerStart };

    // Referencja do wygenerowanego elementu HTML planszy
    this.element = null;
  }

  render() {
    // Generowanie kompletnej planszy gry
    const cells = [];

    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        cells.push(this.createCell({ x, y }));
      }
    }

    // Utworzenie głównego kontenera planszy
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
    // Tworzenie pojedynczego pola planszy
    const key = this.createPositionKey(position);
    const classes = ["board-cell"];
    let label = "Puste pole";

    // Nadanie odpowiedniego typu pola
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

    // Oznaczenie pola startowego gracza
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
    // Aktualizacja wizualnej pozycji gracza na planszy
    this.getCell(previousPosition)?.classList.remove("board-cell-player");
    this.getCell(nextPosition)?.classList.add("board-cell-player");
  }

  updateEnemyPosition(previousPosition, nextPosition) {
    // Aktualizacja wizualnej pozycji przeciwnika
    this.getCell(previousPosition)?.classList.remove("board-cell-enemy");
    this.getCell(nextPosition)?.classList.add("board-cell-enemy");
  }

  collectCoinAt(position) {
    // Obsługa zebrania monety przez gracza
    const key = this.createPositionKey(position);

    if (!this.coins.has(key)) {
      return false;
    }

    this.coins.delete(key);

    const cell = this.getCell(position);

    if (cell) {
      // Usunięcie wizualizacji monety z planszy
      cell.classList.remove("board-cell-coin");
      cell.setAttribute("aria-label", "Gracz");
    }

    return true;
  }

  hasWallAt(position) {
    // Sprawdzenie czy na danym polu znajduje się ściana
    return this.walls.has(this.createPositionKey(position));
  }

  isInside({ x, y }) {
    // Weryfikacja czy współrzędne mieszczą się w granicach planszy
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  addLavaTrail(position) {
    // Dodanie pola lawy pozostawionego przez przeciwnika LavaEnemy
    const key = this.createPositionKey(position);
    this.lavaTrails.add(key);
    this.getCell(position)?.classList.add("board-cell-lava");
  }

  hasLavaTrailAt(position) {
    // Sprawdzenie czy dane pole zawiera lawę
    return this.lavaTrails.has(this.createPositionKey(position));
  }

  setElectricZones(positions) {
    // Wyznaczenie i oznaczenie pól zagrożonych atakiem elektrycznym
    positions.forEach((position) => {
      const key = this.createPositionKey(position);
      this.electricZones.add(key);
      this.getCell(position)?.classList.add("board-cell-electric");
    });
  }

  clearElectricZones() {
    // Usunięcie wszystkich aktywnych pól elektrycznych
    this.electricZones.forEach((key) => {
      const [x, y] = key.split(":").map(Number);
      this.getCell({ x, y })?.classList.remove("board-cell-electric");
    });

    this.electricZones.clear();
  }

  hasElectricZoneAt(position) {
    // Sprawdzenie czy pole znajduje się w strefie elektrycznej
    return this.electricZones.has(this.createPositionKey(position));
  }

  getCell({ x, y }) {
    // Pobranie konkretnego pola planszy z DOM
    return (
        this.element?.querySelector(
            `[data-x="${x}"][data-y="${y}"]`
        ) || null
    );
  }

  createPositionKey({ x, y }) {
    // Zamiana współrzędnych na unikalny klucz tekstowy
    return `${x}:${y}`;
  }
}