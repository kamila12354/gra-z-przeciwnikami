import { createEnemy } from "../enemies/EnemyFactory.js";
import { Board } from "./Board.js";
import { CollisionService } from "./CollisionService.js";
import { Player } from "./Player.js";

const DIRECTION_VECTORS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  KeyW: { x: 0, y: -1 },
  KeyS: { x: 0, y: 1 },
  KeyA: { x: -1, y: 0 },
  KeyD: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export class Game {
  constructor({ preset, root, statsService }) {
    this.preset = preset;
    this.root = root;
    this.statsService = statsService;
    this.board = new Board(preset);
    this.collisionService = new CollisionService(this.board);
    this.player = new Player(preset.playerStart);
    this.enemies = preset.enemies.map((enemyConfig) => createEnemy(enemyConfig));
    this.totalCoins = preset.coins.length;
    this.collectedCoins = 0;
    this.moves = 0;
    this.startedAt = null;
    this.elapsedSeconds = 0;
    this.timerId = null;
    this.enemyLoopId = null;
    this.isFinished = false;
    this.abortController = new AbortController();
  }

  start() {
    const boardContainer = this.root.querySelector("[data-game-board]");
    boardContainer.replaceChildren(this.board.render());
    this.startedAt = Date.now();
    this.updateHud("Zbierz wszystkie monety");
    this.startTimer();
    this.startEnemyLoop();
    this.bindKeyboardControls();
    this.bindTouchControls();
  }

  destroy() {
    this.abortController.abort();
    this.stopTimer();
    this.stopEnemyLoop();
  }

  bindKeyboardControls() {
    document.addEventListener("keydown", (event) => {
      if (!DIRECTION_VECTORS[event.code]) {
        return;
      }

      event.preventDefault();
      this.movePlayer(event.code);
    }, {
      signal: this.abortController.signal
    });
  }

  bindTouchControls() {
    const controls = this.root.querySelector("[data-mobile-controls]");

    controls.addEventListener("click", (event) => {
      const button = event.target.closest("[data-direction]");

      if (!button) {
        return;
      }

      this.movePlayer(button.dataset.direction);
    }, {
      signal: this.abortController.signal
    });
  }

  movePlayer(direction) {
    if (this.isFinished) {
      return;
    }

    const vector = DIRECTION_VECTORS[direction];
    const currentPosition = this.player.getPosition();
    const nextPosition = {
      x: currentPosition.x + vector.x,
      y: currentPosition.y + vector.y
    };

    if (!this.collisionService.canMoveTo(nextPosition)) {
      this.updateHud("Ruch zablokowany przez ścianę albo granicę mapy");
      return;
    }

    this.player.moveTo(nextPosition);
    this.moves += 1;

    requestAnimationFrame(() => {
      const collectedCoin = this.board.collectCoinAt(nextPosition);
      this.board.updatePlayerPosition(currentPosition, nextPosition);

      if (collectedCoin) {
        this.collectedCoins += 1;
      }

      const playerDeathReason = this.getPlayerDeathReason(nextPosition);

      if (playerDeathReason) {
        this.finishWithLoss(playerDeathReason);
        return;
      }

      if (this.collectedCoins === this.totalCoins) {
        this.finishWithWin();
        return;
      }

      this.updateHud(collectedCoin ? "Moneta zebrana" : "Gracz poruszony");
    });
  }

  updateHud(status) {
    this.setHudValue("coins", `${this.collectedCoins} / ${this.totalCoins}`);
    this.setHudValue("moves", String(this.moves));
    this.setHudValue("time", this.formatTime(this.elapsedSeconds));
    this.setHudValue("status", status);
  }

  setHudValue(name, value) {
    const element = this.root.querySelector(`[data-hud-value="${name}"]`);

    if (element) {
      element.textContent = value;
    }
  }

  startTimer() {
    this.timerId = window.setInterval(() => {
      if (!this.startedAt || this.isFinished) {
        return;
      }

      this.elapsedSeconds = Math.floor((Date.now() - this.startedAt) / 1000);
      this.setHudValue("time", this.formatTime(this.elapsedSeconds));
    }, 1000);
  }

  stopTimer() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  updateElapsedTime() {
    if (!this.startedAt) {
      this.elapsedSeconds = 0;
      return;
    }

    this.elapsedSeconds = Math.floor((Date.now() - this.startedAt) / 1000);
    this.setHudValue("time", this.formatTime(this.elapsedSeconds));
  }

  startEnemyLoop() {
    this.enemyLoopId = window.setInterval(() => {
      this.updateEnemies();
    }, 700);
  }

  stopEnemyLoop() {
    if (this.enemyLoopId) {
      window.clearInterval(this.enemyLoopId);
      this.enemyLoopId = null;
    }
  }

  updateEnemies() {
    if (this.isFinished) {
      return;
    }

    const playerPosition = this.player.getPosition();
    this.board.clearElectricZones();

    this.enemies.forEach((enemy) => {
      if (!enemy.canAct()) {
        return;
      }

      const previousPosition = enemy.getPosition();
      const result = enemy.update({
        board: this.board,
        collisionService: this.collisionService,
        playerPosition
      });

      if (result.lavaTrail) {
        this.board.addLavaTrail(result.lavaTrail);
      }

      if (result.electricZones?.length > 0) {
        this.board.setElectricZones(result.electricZones);
      }

      this.board.updateEnemyPosition(previousPosition, enemy.getPosition());
    });

    const deathReason = this.getPlayerDeathReason(this.player.getPosition());

    if (deathReason) {
      this.finishWithLoss(deathReason);
      return;
    }

    this.updateHud("Przeciwnicy wykonali ruch");
  }

  getPlayerDeathReason(position) {
    if (this.enemies.some((enemy) => this.isSamePosition(enemy.getPosition(), position))) {
      return "Złapany przez przeciwnika";
    }

    if (this.board.hasLavaTrailAt(position)) {
      return "Wejście na ślad lawy";
    }

    if (this.board.hasElectricZoneAt(position)) {
      return "Trafienie piorunem electrone";
    }

    return null;
  }

  async finishWithWin() {
    this.isFinished = true;
    this.updateElapsedTime();
    this.stopTimer();
    this.stopEnemyLoop();
    this.abortController.abort();
    this.updateHud("Wygrana - zebrano wszystkie monety");
    this.showEndGameMessage("Wygrana", "Udało się zebrać wszystkie monety na mapie.", "success");

    if (!this.statsService) {
      return;
    }

    try {
      await this.statsService.addResult({
        presetId: this.preset.id,
        presetName: this.preset.name,
        result: "wygrana",
        deathReason: null,
        durationSeconds: this.elapsedSeconds,
        moves: this.moves,
        collectedCoins: this.collectedCoins,
        totalCoins: this.totalCoins
      });
    } catch (error) {
      this.showEndGameMessage("Wygrana", "Wynik gry jest poprawny, ale nie udało się zapisać statystyk.", "warning");
    }
  }

  async finishWithLoss(deathReason) {
    this.isFinished = true;
    this.updateElapsedTime();
    this.stopTimer();
    this.stopEnemyLoop();
    this.abortController.abort();
    this.updateHud(`Przegrana - ${deathReason}`);
    this.showEndGameMessage("Przegrana", deathReason, "danger");

    if (!this.statsService) {
      return;
    }

    try {
      await this.statsService.addResult({
        presetId: this.preset.id,
        presetName: this.preset.name,
        result: "przegrana",
        deathReason,
        durationSeconds: this.elapsedSeconds,
        moves: this.moves,
        collectedCoins: this.collectedCoins,
        totalCoins: this.totalCoins
      });
    } catch (error) {
      this.showEndGameMessage("Przegrana", "Gra zakończona, ale nie udało się zapisać statystyk.", "danger");
    }
  }

  showEndGameMessage(title, description, type) {
    const existingMessage = this.root.querySelector("[data-game-result]");

    if (existingMessage) {
      existingMessage.remove();
    }

    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.dataset.gameResult = "true";
    alert.role = "status";

    const heading = document.createElement("h2");
    heading.className = "h5";
    heading.textContent = title;

    const text = document.createElement("p");
    text.className = "mb-0";
    text.textContent = description;

    alert.appendChild(heading);
    alert.appendChild(text);
    this.root.querySelector("[data-game-board]").after(alert);
  }

  isSamePosition(firstPosition, secondPosition) {
    return firstPosition.x === secondPosition.x && firstPosition.y === secondPosition.y;
  }

  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }
}
