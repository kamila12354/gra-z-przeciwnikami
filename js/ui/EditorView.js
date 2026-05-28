import { createAlert, createElement, createPageHeader } from "./dom.js";

const ENEMY_TYPES = {
  normal: "Normal - pościg za graczem",
  lava: "Lava - zostawia ślady",
  electrone: "Electrone - atakuje piorunem"
};

export class EditorView {
  constructor(params = {}) {
    this.presetId = params.presetId || null;
    this.preset = params.preset || null;
    this.enemies = this.createInitialEnemies();
  }

  render() {
    const section = createElement("section", {
      attributes: {
        "aria-labelledby": "editor-title"
      },
      children: [
        createPageHeader(
          this.presetId ? "Edycja presetu" : "Nowy preset",
          "Ustaw dane mapy i dodawaj przeciwników z parametrami."
        ),
        this.createEditorForm(),
        this.createEnemyPanel()
      ]
    });

    section.querySelector("h1").id = "editor-title";

    return section;
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
                this.createInput("Nazwa presetu", "presetName", "text", this.preset?.name || "Klasyczny labirynt"),
                this.createInput("Szerokość", "presetWidth", "number", String(this.preset?.width || 12)),
                this.createInput("Wysokość", "presetHeight", "number", String(this.preset?.height || 10))
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
      this.showFormMessage(form, "Zapis całego presetu zostanie podłączony w etapie edytora map.", "info");
    });

    return form;
  }

  createInput(labelText, id, type, value) {
    const input = createElement("input", {
      className: "form-control",
      attributes: {
        id,
        name: id,
        type,
        value
      }
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

    this.enemies = [...this.enemies, enemy];
    this.refreshEnemyList(form.closest(".card-body").querySelector("[data-enemy-list-wrapper]"));
    this.showEnemyMessage(form.closest(".card-body"), "Przeciwnik został dodany.", "success");
    form.reset();
    form.elements.enemySpeed.value = "1";
    form.elements.enemyIntelligence.value = "4";
    form.elements.enemyX.value = "1";
    form.elements.enemyY.value = "1";
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

  getMapSize() {
    const form = document.querySelector("[data-map-form]");
    const width = Number(form?.elements.presetWidth.value || this.preset?.width || 12);
    const height = Number(form?.elements.presetHeight.value || this.preset?.height || 10);

    return {
      width: Number.isInteger(width) && width > 0 ? width : 12,
      height: Number.isInteger(height) && height > 0 ? height : 10
    };
  }

  isWall(position) {
    return Boolean(this.preset?.walls?.some((wall) => wall.x === position.x && wall.y === position.y));
  }

  isPlayerStart(position) {
    return this.preset?.playerStart?.x === position.x && this.preset?.playerStart?.y === position.y;
  }

  isEnemyStart(position) {
    return this.enemies.some((enemy) => enemy.start.x === position.x && enemy.start.y === position.y);
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

  refreshEnemyList(wrapper) {
    const currentList = wrapper.querySelector("[data-enemy-list], [data-enemy-empty]");
    currentList.replaceWith(this.renderEnemyList());
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
}
