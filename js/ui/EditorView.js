import { createAlert, createElement, createPageHeader } from "./dom.js";

const ENEMY_TYPES = {
  normal: "Normal - pościg za graczem",
  lava: "Lava - zostawia ślady",
  electrone: "Electrone - atakuje piorunem"
};

const EDITOR_TOOLS = [
  ["wall", "Ściana"],
  ["coin", "Moneta"],
  ["player", "Gracz"],
  ["erase", "Gumka"]
];

export class EditorView {
  constructor(params = {}) {
    this.presetId = params.presetId || null;
    this.preset = params.preset || null;
    this.presetRepository = params.presetRepository || null;
    this.presets = params.presets || [];
    this.activeTool = "wall";
    this.name = this.preset?.name || "Nowy labirynt";
    this.width = Number(this.preset?.width || 12);
    this.height = Number(this.preset?.height || 10);
    this.playerStart = this.preset?.playerStart ? { ...this.preset.playerStart } : { x: 1, y: 1 };
    this.walls = new Set((this.preset?.walls || []).map((wall) => this.createPositionKey(wall)));
    this.coins = new Set((this.preset?.coins || []).map((coin) => this.createPositionKey(coin)));
    this.enemies = this.createInitialEnemies();
  }

  render() {
    if (this.presetId && !this.preset) {
      return this.createMissingPresetView();
    }

    const section = createElement("section", {
      attributes: {
        "aria-labelledby": "editor-title"
      },
      children: [
        createPageHeader(
          this.presetId ? "Edycja presetu" : "Nowy preset",
          "Ustaw dane mapy, klikaj pola planszy i zapisuj gotowe presety."
        ),
        this.createEditorForm(),
        this.createBoardEditor(),
        this.createEnemyPanel()
      ]
    });

    section.querySelector("h1").id = "editor-title";

    return section;
  }

  createMissingPresetView() {
    return createElement("section", {
      className: "py-5",
      attributes: {
        "aria-labelledby": "missing-editor-preset-title"
      },
      children: [
        createElement("h1", {
          className: "h3 mb-3",
          id: "missing-editor-preset-title",
          text: "Nie znaleziono presetu"
        }),
        createElement("p", {
          className: "text-body-secondary",
          text: `Preset ${this.presetId} nie istnieje albo został usunięty.`
        }),
        createElement("a", {
          className: "btn btn-primary",
          attributes: {
            href: "#/presets"
          },
          text: "Wróć do presetów"
        })
      ]
    });
  }

  createInitialEnemies() {
    if (!this.preset?.enemies) {
      return [];
    }

    return this.preset.enemies.map((enemy, index) => ({
      id: enemy.id || `enemy-${index}-${Date.now()}`,
      type: enemy.type,
      speed: Number(enemy.speed),
      intelligence: Number(enemy.intelligence),
      start: { ...enemy.start }
    }));
  }

  createEditorForm() {
    const form = createElement("form", {
      className: "card mb-4",
      attributes: {
        novalidate: "true",
        "data-map-form": "true"
      },
      children: [
        createElement("div", {
          className: "card-body",
          children: [
            createElement("h2", {
              className: "h5 mb-3",
              text: "Dane mapy"
            }),
            createElement("div", {
              className: "row g-3",
              children: [
                this.createInput("Nazwa presetu", "presetName", "text", this.name),
                this.createInput("Szerokość", "presetWidth", "number", String(this.width), "6", "20"),
                this.createInput("Wysokość", "presetHeight", "number", String(this.height), "6", "20")
              ]
            }),
            createElement("div", {
              className: "d-flex flex-wrap gap-2 mt-4",
              children: [
                createElement("button", {
                  className: "btn btn-primary",
                  attributes: {
                    type: "submit"
                  },
                  text: "Zapisz preset"
                }),
                createElement("button", {
                  className: "btn btn-outline-secondary",
                  attributes: {
                    type: "button",
                    "data-map-action": "resize"
                  },
                  text: "Odśwież rozmiar"
                }),
                createElement("a", {
                  className: "btn btn-outline-secondary",
                  attributes: {
                    href: "#/presets"
                  },
                  text: "Wróć"
                })
              ]
            })
          ]
        })
      ]
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.handlePresetSubmit(form);
    });

    form.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-map-action]");

      if (actionButton?.dataset.mapAction === "resize") {
        this.handleResize(form);
      }
    });

    return form;
  }

  createInput(labelText, id, type, value, min = null, max = null) {
    const attributes = {
      id,
      name: id,
      type,
      value
    };

    if (min !== null) {
      attributes.min = min;
    }

    if (max !== null) {
      attributes.max = max;
    }

    const input = createElement("input", {
      className: "form-control",
      attributes
    });

    return createElement("div", {
      className: "col-12 col-md-4",
      children: [
        createElement("label", {
          className: "form-label",
          attributes: {
            for: id
          },
          text: labelText
        }),
        input,
        createElement("div", {
          className: "invalid-feedback",
          attributes: {
            "data-field-error": id
          }
        })
      ]
    });
  }

  createBoardEditor() {
    const board = createElement("div", {
      className: "editor-board",
      attributes: {
        "aria-label": "Edytor planszy",
        "data-editor-board": "true",
        "data-board-width": String(this.width)
      },
      children: this.createEditorCells()
    });

    board.addEventListener("click", (event) => {
      const cell = event.target.closest("[data-editor-cell]");

      if (!cell) {
        return;
      }

      this.applyToolToPosition({
        x: Number(cell.dataset.x),
        y: Number(cell.dataset.y)
      });
      this.refreshBoard();
      this.refreshEnemyList(document.querySelector("[data-enemy-list-wrapper]"));
    });

    return createElement("section", {
      className: "card mb-4",
      attributes: {
        "aria-labelledby": "board-editor-title"
      },
      children: [
        createElement("div", {
          className: "card-body",
          children: [
            createElement("div", {
              className: "d-flex flex-column flex-lg-row justify-content-between gap-3 mb-3",
              children: [
                createElement("div", {
                  children: [
                    createElement("h2", {
                      className: "h5 mb-1",
                      id: "board-editor-title",
                      text: "Plansza"
                    }),
                    createElement("p", {
                      className: "text-body-secondary mb-0",
                      text: "Wybierz narzędzie i kliknij pole."
                    })
                  ]
                }),
                this.createToolButtons()
              ]
            }),
            board
          ]
        })
      ]
    });
  }

  createToolButtons() {
    const group = createElement("div", {
      className: "btn-group flex-wrap",
      attributes: {
        role: "group",
        "aria-label": "Narzędzia edytora"
      },
      children: EDITOR_TOOLS.map(([tool, label]) => createElement("button", {
        className: tool === this.activeTool ? "btn btn-primary" : "btn btn-outline-primary",
        attributes: {
          type: "button",
          "data-editor-tool": tool
        },
        text: label
      }))
    });

    group.addEventListener("click", (event) => {
      const toolButton = event.target.closest("[data-editor-tool]");

      if (!toolButton) {
        return;
      }

      this.activeTool = toolButton.dataset.editorTool;
      group.querySelectorAll("[data-editor-tool]").forEach((button) => {
        const isActive = button.dataset.editorTool === this.activeTool;
        button.classList.toggle("btn-primary", isActive);
        button.classList.toggle("btn-outline-primary", !isActive);
      });
    });

    return group;
  }

  createEditorCells() {
    const cells = [];

    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        cells.push(this.createEditorCell({ x, y }));
      }
    }

    return cells;
  }

  createEditorCell(position) {
    const key = this.createPositionKey(position);
    const classes = ["editor-cell"];
    let label = "Puste pole";

    if (this.walls.has(key)) {
      classes.push("editor-cell-wall");
      label = "Ściana";
    } else if (this.coins.has(key)) {
      classes.push("editor-cell-coin");
      label = "Moneta";
    } else if (this.isPlayerStart(position)) {
      classes.push("editor-cell-player");
      label = "Gracz";
    } else if (this.isEnemyStart(position)) {
      classes.push("editor-cell-enemy");
      label = "Przeciwnik";
    }

    return createElement("button", {
      className: classes.join(" "),
      attributes: {
        type: "button",
        "aria-label": label,
        "data-editor-cell": "true",
        "data-x": String(position.x),
        "data-y": String(position.y)
      }
    });
  }

  applyToolToPosition(position) {
    const key = this.createPositionKey(position);

    if (this.activeTool === "wall") {
      this.removeCoin(position);
      this.removeEnemyAt(position);

      if (this.isPlayerStart(position)) {
        this.playerStart = null;
      }

      this.walls.add(key);
      return;
    }

    if (this.activeTool === "coin") {
      this.walls.delete(key);
      this.removeEnemyAt(position);
      this.coins.add(key);
      return;
    }

    if (this.activeTool === "player") {
      this.walls.delete(key);
      this.removeCoin(position);
      this.removeEnemyAt(position);
      this.playerStart = { ...position };
      return;
    }

    this.walls.delete(key);
    this.removeCoin(position);
    this.removeEnemyAt(position);

    if (this.isPlayerStart(position)) {
      this.playerStart = null;
    }
  }

  createEnemyPanel() {
    const enemyForm = this.createEnemyForm();
    const enemyList = this.createEnemyList();

    return createElement("section", {
      className: "card",
      attributes: {
        "aria-labelledby": "enemy-panel-title"
      },
      children: [
        createElement("div", {
          className: "card-body",
          children: [
            createElement("h2", {
              className: "h5 mb-3",
              id: "enemy-panel-title",
              text: "Przeciwnicy"
            }),
            enemyForm,
            createElement("hr"),
            enemyList
          ]
        })
      ]
    });
  }

  createEnemyForm() {
    const form = createElement("form", {
      className: "enemy-form",
      attributes: {
        novalidate: "true",
        "data-enemy-form": "true"
      },
      children: [
        createElement("div", {
          className: "row g-3",
          children: [
            this.createEnemyTypeSelect(),
            this.createEnemyNumberInput("Prędkość", "enemySpeed", "1", "1", "5"),
            this.createEnemyNumberInput("Inteligencja", "enemyIntelligence", "4", "1", "10"),
            this.createEnemyNumberInput("Start X", "enemyX", "1", "0", "99"),
            this.createEnemyNumberInput("Start Y", "enemyY", "1", "0", "99")
          ]
        }),
        createElement("div", {
          className: "d-flex flex-wrap gap-2 mt-3",
          children: [
            createElement("button", {
              className: "btn btn-success",
              attributes: {
                type: "submit"
              },
              text: "Dodaj przeciwnika"
            })
          ]
        })
      ]
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.handleEnemySubmit(form);
    });

    return form;
  }

  createEnemyTypeSelect() {
    const select = createElement("select", {
      className: "form-select",
      attributes: {
        id: "enemyType",
        name: "enemyType"
      },
      children: Object.entries(ENEMY_TYPES).map(([value, label]) => createElement("option", {
        attributes: { value },
        text: label
      }))
    });

    return createElement("div", {
      className: "col-12 col-lg-4",
      children: [
        createElement("label", {
          className: "form-label",
          attributes: {
            for: "enemyType"
          },
          text: "Typ"
        }),
        select,
        createElement("div", {
          className: "invalid-feedback",
          attributes: {
            "data-field-error": "enemyType"
          }
        })
      ]
    });
  }

  createEnemyNumberInput(labelText, id, value, min, max) {
    return createElement("div", {
      className: "col-6 col-lg",
      children: [
        createElement("label", {
          className: "form-label",
          attributes: {
            for: id
          },
          text: labelText
        }),
        createElement("input", {
          className: "form-control",
          attributes: {
            id,
            max,
            min,
            name: id,
            type: "number",
            value
          }
        }),
        createElement("div", {
          className: "invalid-feedback",
          attributes: {
            "data-field-error": id
          }
        })
      ]
    });
  }

  createEnemyList() {
    const wrapper = createElement("div", {
      attributes: {
        "data-enemy-list-wrapper": "true"
      },
      children: [
        createElement("h3", {
          className: "h6 mb-3",
          text: "Aktywni przeciwnicy"
        }),
        this.renderEnemyList()
      ]
    });

    wrapper.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-enemy-action]");

      if (!actionButton) {
        return;
      }

      if (actionButton.dataset.enemyAction === "remove") {
        this.enemies = this.enemies.filter((enemy) => enemy.id !== actionButton.dataset.enemyId);
        this.refreshEnemyList(wrapper);
        this.refreshBoard();
        this.showEnemyMessage(wrapper, "Przeciwnik został usunięty.", "info");
      }
    });

    return wrapper;
  }

  renderEnemyList() {
    if (this.enemies.length === 0) {
      return createElement("p", {
        className: "text-body-secondary mb-0",
        attributes: {
          "data-enemy-empty": "true"
        },
        text: "Brak przeciwników w tym presecie."
      });
    }

    return createElement("div", {
      className: "list-group",
      attributes: {
        "data-enemy-list": "true"
      },
      children: this.enemies.map((enemy) => this.createEnemyItem(enemy))
    });
  }

  createEnemyItem(enemy) {
    return createElement("article", {
      className: "list-group-item",
      attributes: {
        "data-enemy-id": enemy.id
      },
      children: [
        createElement("div", {
          className: "d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3",
          children: [
            createElement("div", {
              children: [
                createElement("h4", {
                  className: "h6 mb-1",
                  text: ENEMY_TYPES[enemy.type] || enemy.type
                }),
                createElement("p", {
                  className: "text-body-secondary mb-0",
                  text: `Prędkość: ${enemy.speed}. Inteligencja: ${enemy.intelligence}. Start: X ${enemy.start.x}, Y ${enemy.start.y}.`
                })
              ]
            }),
            createElement("button", {
              className: "btn btn-outline-danger btn-sm",
              attributes: {
                type: "button",
                "data-enemy-action": "remove",
                "data-enemy-id": enemy.id
              },
              text: "Usuń"
            })
          ]
        })
      ]
    });
  }

  handleEnemySubmit(form) {
    this.clearValidation(form);

    const formData = new FormData(form);
    const enemy = {
      id: crypto.randomUUID(),
      type: String(formData.get("enemyType")),
      speed: Number(formData.get("enemySpeed")),
      intelligence: Number(formData.get("enemyIntelligence")),
      start: {
        x: Number(formData.get("enemyX")),
        y: Number(formData.get("enemyY"))
      }
    };

    const errors = this.validateEnemy(enemy);

    if (Object.keys(errors).length > 0) {
      this.showValidationErrors(form, errors);
      return;
    }

    this.walls.delete(this.createPositionKey(enemy.start));
    this.removeCoin(enemy.start);
    this.enemies = [...this.enemies, enemy];
    this.refreshEnemyList(form.closest(".card-body").querySelector("[data-enemy-list-wrapper]"));
    this.refreshBoard();
    this.showEnemyMessage(form.closest(".card-body"), "Przeciwnik został dodany.", "success");
    form.reset();
    form.elements.enemySpeed.value = "1";
    form.elements.enemyIntelligence.value = "4";
    form.elements.enemyX.value = "1";
    form.elements.enemyY.value = "1";
  }

  async handlePresetSubmit(form) {
    this.clearValidation(form);
    this.syncMapFields(form);

    const errors = this.validatePreset(form);

    if (Object.keys(errors).length > 0) {
      this.showValidationErrors(form, errors);
      this.showFormMessage(form, "Popraw błędy formularza przed zapisem.", "danger");
      return;
    }

    const preset = this.createPresetFromState();

    try {
      await this.presetRepository.save(preset);
      this.showFormMessage(form, "Preset został zapisany w localStorage.", "success");
      window.location.hash = "#/presets";
    } catch (error) {
      this.showFormMessage(form, error.message, "danger");
    }
  }

  handleResize(form) {
    this.clearValidation(form);
    this.syncMapFields(form);

    const errors = this.validateMapFields(form);

    if (Object.keys(errors).length > 0) {
      this.showValidationErrors(form, errors);
      return;
    }

    this.trimStateToBounds();
    this.refreshEnemyList(document.querySelector("[data-enemy-list-wrapper]"));
    this.refreshBoard();
    this.showFormMessage(form, "Rozmiar planszy został odświeżony.", "info");
  }

  validatePreset(form) {
    const errors = this.validateMapFields(form);

    if (!this.playerStart) {
      errors.presetName = errors.presetName || "Mapa musi mieć ustawioną pozycję gracza.";
    }

    if (this.coins.size === 0) {
      errors.presetName = errors.presetName || "Mapa musi mieć co najmniej jedną monetę.";
    }

    return errors;
  }

  validateMapFields(form) {
    const errors = {};
    const name = form.elements.presetName.value.trim();
    const width = Number(form.elements.presetWidth.value);
    const height = Number(form.elements.presetHeight.value);

    if (name.length < 3 || name.length > 40) {
      errors.presetName = "Nazwa musi mieć od 3 do 40 znaków.";
    }

    if (!Number.isInteger(width) || width < 6 || width > 20) {
      errors.presetWidth = "Szerokość musi być liczbą od 6 do 20.";
    }

    if (!Number.isInteger(height) || height < 6 || height > 20) {
      errors.presetHeight = "Wysokość musi być liczbą od 6 do 20.";
    }

    return errors;
  }

  validateEnemy(enemy) {
    const errors = {};
    const mapSize = this.getMapSize();

    if (!ENEMY_TYPES[enemy.type]) {
      errors.enemyType = "Wybierz poprawny typ przeciwnika.";
    }

    if (!Number.isInteger(enemy.speed) || enemy.speed < 1 || enemy.speed > 5) {
      errors.enemySpeed = "Prędkość musi być liczbą od 1 do 5.";
    }

    if (!Number.isInteger(enemy.intelligence) || enemy.intelligence < 1 || enemy.intelligence > 10) {
      errors.enemyIntelligence = "Inteligencja musi być liczbą od 1 do 10.";
    }

    if (!Number.isInteger(enemy.start.x) || enemy.start.x < 0 || enemy.start.x >= mapSize.width) {
      errors.enemyX = `X musi być liczbą od 0 do ${mapSize.width - 1}.`;
    }

    if (!Number.isInteger(enemy.start.y) || enemy.start.y < 0 || enemy.start.y >= mapSize.height) {
      errors.enemyY = `Y musi być liczbą od 0 do ${mapSize.height - 1}.`;
    }

    if (this.isWall(enemy.start)) {
      errors.enemyX = "Pozycja startowa nie może być ścianą.";
      errors.enemyY = "Pozycja startowa nie może być ścianą.";
    }

    if (this.isPlayerStart(enemy.start)) {
      errors.enemyX = "Pozycja startowa nie może być polem gracza.";
      errors.enemyY = "Pozycja startowa nie może być polem gracza.";
    }

    if (this.isEnemyStart(enemy.start)) {
      errors.enemyX = "Na tej pozycji jest już inny przeciwnik.";
      errors.enemyY = "Na tej pozycji jest już inny przeciwnik.";
    }

    return errors;
  }

  createPresetFromState() {
    return {
      id: this.preset?.id || this.createPresetId(this.name),
      name: this.name,
      width: this.width,
      height: this.height,
      playerStart: { ...this.playerStart },
      walls: this.setToPositions(this.walls),
      coins: this.setToPositions(this.coins),
      enemies: this.enemies.map((enemy) => ({
        id: enemy.id,
        type: enemy.type,
        speed: enemy.speed,
        intelligence: enemy.intelligence,
        start: { ...enemy.start }
      }))
    };
  }

  createPresetId(name) {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || "preset";

    let candidate = slug;
    let counter = 1;

    while (this.presets.some((preset) => preset.id === candidate)) {
      counter += 1;
      candidate = `${slug}-${counter}`;
    }

    return candidate;
  }

  syncMapFields(form) {
    this.name = form.elements.presetName.value.trim();
    this.width = Number(form.elements.presetWidth.value);
    this.height = Number(form.elements.presetHeight.value);
  }

  trimStateToBounds() {
    const isInBounds = (position) => position.x >= 0 && position.y >= 0 && position.x < this.width && position.y < this.height;
    this.walls = this.filterPositionSet(this.walls, isInBounds);
    this.coins = this.filterPositionSet(this.coins, isInBounds);
    this.enemies = this.enemies.filter((enemy) => isInBounds(enemy.start));

    if (this.playerStart && !isInBounds(this.playerStart)) {
      this.playerStart = null;
    }
  }

  filterPositionSet(positionSet, predicate) {
    return new Set([...positionSet].filter((key) => predicate(this.keyToPosition(key))));
  }

  getMapSize() {
    const form = document.querySelector("[data-map-form]");
    const width = Number(form?.elements.presetWidth.value || this.width);
    const height = Number(form?.elements.presetHeight.value || this.height);

    return {
      width: Number.isInteger(width) && width > 0 ? width : this.width,
      height: Number.isInteger(height) && height > 0 ? height : this.height
    };
  }

  refreshBoard() {
    const board = document.querySelector("[data-editor-board]");

    if (!board) {
      return;
    }

    board.dataset.boardWidth = String(this.width);
    board.replaceChildren(...this.createEditorCells());
  }

  refreshEnemyList(wrapper) {
    if (!wrapper) {
      return;
    }

    const currentList = wrapper.querySelector("[data-enemy-list], [data-enemy-empty]");
    currentList.replaceWith(this.renderEnemyList());
  }

  clearValidation(form) {
    form.querySelectorAll(".is-invalid").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll("[data-field-error]").forEach((field) => {
      field.textContent = "";
    });
  }

  showValidationErrors(form, errors) {
    Object.entries(errors).forEach(([fieldName, message]) => {
      const field = form.elements[fieldName];
      const error = form.querySelector(`[data-field-error="${fieldName}"]`);

      field?.classList.add("is-invalid");

      if (error) {
        error.textContent = message;
      }
    });
  }

  showFormMessage(form, message, type = "info") {
    const existingMessage = form.querySelector("[data-form-message]");

    if (existingMessage) {
      existingMessage.remove();
    }

    const alert = createAlert(message, type);
    alert.classList.add("mt-3", "mb-0");
    alert.dataset.formMessage = "true";
    form.querySelector(".card-body").appendChild(alert);
  }

  showEnemyMessage(container, message, type = "info") {
    const cardBody = container.closest(".card-body") || container;
    const existingMessage = cardBody.querySelector("[data-enemy-message]");

    if (existingMessage) {
      existingMessage.remove();
    }

    const alert = createAlert(message, type);
    alert.classList.add("mt-3", "mb-0");
    alert.dataset.enemyMessage = "true";
    cardBody.appendChild(alert);
  }

  removeCoin(position) {
    this.coins.delete(this.createPositionKey(position));
  }

  removeEnemyAt(position) {
    this.enemies = this.enemies.filter((enemy) => !this.isSamePosition(enemy.start, position));
  }

  isWall(position) {
    return this.walls.has(this.createPositionKey(position));
  }

  isPlayerStart(position) {
    return this.playerStart?.x === position.x && this.playerStart?.y === position.y;
  }

  isEnemyStart(position) {
    return this.enemies.some((enemy) => this.isSamePosition(enemy.start, position));
  }

  isSamePosition(firstPosition, secondPosition) {
    return firstPosition.x === secondPosition.x && firstPosition.y === secondPosition.y;
  }

  setToPositions(positionSet) {
    return [...positionSet].map((key) => this.keyToPosition(key));
  }

  keyToPosition(key) {
    const [x, y] = key.split(":").map(Number);
    return { x, y };
  }

  createPositionKey({ x, y }) {
    return `${x}:${y}`;
  }
}
