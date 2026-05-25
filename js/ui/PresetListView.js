import { createElement, createEmptyState, createPageHeader } from "./dom.js";

const demoPresets = [
  {
    id: "classic-01",
    name: "Klasyczny labirynt",
    size: "12 x 10",
    coins: 8,
    enemies: 3
  },
  {
    id: "lava-run",
    name: "Lava Run",
    size: "14 x 12",
    coins: 12,
    enemies: 4
  }
];

export class PresetListView {
  render() {
    const addButton = createElement("a", {
      className: "btn btn-primary",
      attributes: {
        href: "#/editor"
      },
      text: "Nowy preset"
    });

    const section = createElement("section", {
      attributes: {
        "aria-labelledby": "preset-list-title"
      },
      children: [
        createPageHeader(
          "Presety map",
          "Wybierz mapę do gry albo przejdź do edytora, aby przygotować własny układ.",
          [addButton]
        )
      ]
    });

    section.querySelector("h1").id = "preset-list-title";

    const list = createElement("div", {
      className: "row g-3",
      attributes: {
        "data-preset-list": "true"
      }
    });

    demoPresets.forEach((preset) => {
      list.appendChild(this.createPresetCard(preset));
    });

    list.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-preset-action]");

      if (!actionButton) {
        return;
      }

      const { presetAction, presetId } = actionButton.dataset;

      if (presetAction === "delete") {
        event.preventDefault();
        actionButton.closest("[data-preset-card]").remove();
        this.showListMessage(section, `Preset ${presetId} został usunięty z widoku testowego.`);
      }
    });

    section.appendChild(list);

    if (demoPresets.length === 0) {
      section.appendChild(createEmptyState(
        "Brak presetów",
        "Dodaj pierwszy preset, żeby rozpocząć testowanie gry."
      ));
    }

    return section;
  }

  createPresetCard(preset) {
    return createElement("article", {
      className: "col-12 col-lg-6",
      attributes: {
        "data-preset-card": preset.id
      },
      children: [
        createElement("div", {
          className: "card h-100",
          children: [
            createElement("div", {
              className: "card-body",
              children: [
                createElement("h2", {
                  className: "h5 card-title",
                  text: preset.name
                }),
                createElement("p", {
                  className: "card-text text-body-secondary",
                  text: `Rozmiar: ${preset.size}. Monety: ${preset.coins}. Przeciwnicy: ${preset.enemies}.`
                }),
                createElement("div", {
                  className: "d-flex flex-wrap gap-2",
                  children: [
                    createElement("a", {
                      className: "btn btn-success",
                      attributes: {
                        href: `#/game/${preset.id}`
                      },
                      text: "Graj"
                    }),
                    createElement("a", {
                      className: "btn btn-outline-primary",
                      attributes: {
                        href: `#/editor/${preset.id}`
                      },
                      text: "Edytuj"
                    }),
                    createElement("button", {
                      className: "btn btn-outline-danger",
                      attributes: {
                        type: "button",
                        "data-preset-action": "delete",
                        "data-preset-id": preset.id
                      },
                      text: "Usuń"
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });
  }

  showListMessage(section, message) {
    const existingMessage = section.querySelector("[data-view-message]");

    if (existingMessage) {
      existingMessage.remove();
    }

    const alert = createElement("div", {
      className: "alert alert-info",
      attributes: {
        role: "status",
        "data-view-message": "true"
      },
      text: message
    });

    section.insertBefore(alert, section.querySelector("[data-preset-list]"));
  }
}

