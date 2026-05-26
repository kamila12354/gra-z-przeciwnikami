import { createAlert, createElement, createEmptyState, createPageHeader } from "./dom.js";

export class PresetListView {
  constructor({ presetRepository }) {
    this.presetRepository = presetRepository;
  }

  render() {
    const presets = this.presetRepository.getAll();
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

    presets.forEach((preset) => {
      list.appendChild(this.createPresetCard(preset));
    });

    list.addEventListener("click", async (event) => {
      const actionButton = event.target.closest("[data-preset-action]");

      if (!actionButton) {
        return;
      }

      const { presetAction, presetId } = actionButton.dataset;

      if (presetAction === "delete") {
        event.preventDefault();

        try {
          await this.presetRepository.deleteById(presetId);
          actionButton.closest("[data-preset-card]").remove();
          this.showListMessage(section, `Preset ${presetId} został usunięty.`);
          this.toggleEmptyState(section);
        } catch (error) {
          this.showListMessage(section, error.message, "danger");
        }
      }
    });

    section.appendChild(list);

    if (presets.length === 0) {
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
                  text: `Rozmiar: ${preset.width} x ${preset.height}. Monety: ${preset.coins.length}. Przeciwnicy: ${preset.enemies.length}.`
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

  showListMessage(section, message, type = "info") {
    const existingMessage = section.querySelector("[data-view-message]");

    if (existingMessage) {
      existingMessage.remove();
    }

    const alert = createAlert(message, type);
    alert.dataset.viewMessage = "true";

    section.insertBefore(alert, section.querySelector("[data-preset-list]"));
  }

  toggleEmptyState(section) {
    const list = section.querySelector("[data-preset-list]");

    if (list.children.length > 0) {
      return;
    }

    section.appendChild(createEmptyState(
      "Brak presetów",
      "Dodaj pierwszy preset, żeby rozpocząć testowanie gry."
    ));
  }
}
