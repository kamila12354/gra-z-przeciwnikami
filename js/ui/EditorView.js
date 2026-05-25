import { createElement, createPageHeader } from "./dom.js";

export class EditorView {
  constructor(params = {}) {
    this.presetId = params.presetId || null;
  }

  render() {
    const section = createElement("section", {
      attributes: {
        "aria-labelledby": "editor-title"
      },
      children: [
        createPageHeader(
          this.presetId ? "Edycja presetu" : "Nowy preset",
          "Tutaj powstanie formularz mapy, narzędzia do ustawiania pól i lista przeciwników."
        ),
        this.createEditorForm(),
        this.createEnemyPanel()
      ]
    });

    section.querySelector("h1").id = "editor-title";

    return section;
  }

  createEditorForm() {
    const form = createElement("form", {
      className: "card mb-4",
      attributes: {
        novalidate: "true"
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
                this.createInput("Nazwa presetu", "presetName", "text", "Klasyczny labirynt"),
                this.createInput("Szerokość", "presetWidth", "number", "12"),
                this.createInput("Wysokość", "presetHeight", "number", "10")
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
      this.showFormMessage(form, "Walidacja i zapis zostaną dodane w kolejnych etapach.");
    });

    return form;
  }

  createInput(labelText, id, type, placeholder) {
    const input = createElement("input", {
      className: "form-control",
      attributes: {
        id,
        name: id,
        placeholder,
        type
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
          text: "To pole będzie walidowane w następnym etapie."
        })
      ]
    });
  }

  createEnemyPanel() {
    const enemies = [
      ["normal", "Pościg za graczem"],
      ["lava", "Zostawia ślady"],
      ["electrone", "Atakuje piorunem"]
    ];

    const list = createElement("div", {
      className: "list-group",
      attributes: {
        "data-enemy-list": "true"
      },
      children: enemies.map(([type, description]) => createElement("button", {
        className: "list-group-item list-group-item-action",
        attributes: {
          type: "button",
          "data-enemy-type": type
        },
        text: `${type} - ${description}`
      }))
    });

    list.addEventListener("click", (event) => {
      const enemyButton = event.target.closest("[data-enemy-type]");

      if (!enemyButton) {
        return;
      }

      this.showEnemyMessage(list, `Wybrano typ przeciwnika: ${enemyButton.dataset.enemyType}.`);
    });

    return createElement("section", {
      className: "card",
      attributes: {
        "aria-label": "Lista typów przeciwników"
      },
      children: [
        createElement("div", {
          className: "card-body",
          children: [
            createElement("h2", {
              className: "h5 mb-3",
              text: "Przeciwnicy"
            }),
            list
          ]
        })
      ]
    });
  }

  showFormMessage(form, message) {
    const existingMessage = form.querySelector("[data-form-message]");

    if (existingMessage) {
      existingMessage.remove();
    }

    form.querySelector(".card-body").appendChild(createElement("div", {
      className: "alert alert-info mt-3 mb-0",
      attributes: {
        role: "status",
        "data-form-message": "true"
      },
      text: message
    }));
  }

  showEnemyMessage(list, message) {
    const cardBody = list.closest(".card-body");
    const existingMessage = cardBody.querySelector("[data-enemy-message]");

    if (existingMessage) {
      existingMessage.remove();
    }

    cardBody.appendChild(createElement("div", {
      className: "alert alert-secondary mt-3 mb-0",
      attributes: {
        role: "status",
        "data-enemy-message": "true"
      },
      text: message
    }));
  }
}

