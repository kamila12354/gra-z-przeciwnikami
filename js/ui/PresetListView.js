import { createAlert, createElement, createEmptyState, createPageHeader } from "./dom.js";

// Widok wyświetlający listę dostępnych presetów map
export class PresetListView {
  constructor({ presetRepository }) {
    // Repozytorium przechowujące presety
    this.presetRepository = presetRepository;
  }

  // Generowanie widoku listy presetów
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

    // Obsługa usuwania presetów
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

          this.showListMessage(
              section,
              `Preset ${presetId} został usunięty.`
          );

          this.toggleEmptyState(section);
        } catch (error) {
          this.showListMessage(
              section,
              error.message,
              "danger"
          );
        }
      }
    });

    section.appendChild(list);

    // Wyświetlenie komunikatu gdy brak presetów
    if (presets.length === 0) {
      section.appendChild(
          createEmptyState(
              "Brak presetów",
              "Dodaj pierwszy preset, żeby rozpocząć testowanie gry."
          )
      );
    }

    return section;
  }

  // Tworzenie pojedynczej karty presetu
  createPresetCard(preset) {
    return createElement("article", {
      className: "col-12 col-md-6 col-xl-4",
      attributes: {
        "data-preset-card": preset.id
      },
      children: [
        createElement("div", {
          className: "preset-card",
          children: [

            // Nagłówek karty
            createElement("div", {
              className: "preset-card-top",
              children: [
                createElement("div", {
                  className: "preset-badge",
                  text: "MAPA"
                }),

                createElement("div", {
                  className: "preset-id",
                  text: `#${preset.id.slice(0, 4)}`
                })
              ]
            }),

            // Podgląd mapy
            createElement("div", {
              className: "preset-preview",
              children: [
                createElement("div", {
                  className: "preview-grid"
                })
              ]
            }),

            // Informacje o presecie
            createElement("div", {
              className: "preset-content",
              children: [
                createElement("h2", {
                  className: "preset-title",
                  text: preset.name
                }),

                createElement("div", {
                  className: "preset-stats",
                  children: [
                    createElement("div", {
                      className: "preset-stat",
                      text: `📏 ${preset.width}x${preset.height}`
                    }),

                    createElement("div", {
                      className: "preset-stat",
                      text: `🪙 ${preset.coins.length}`
                    }),

                    createElement("div", {
                      className: "preset-stat",
                      text: `👾 ${preset.enemies.length}`
                    })
                  ]
                }),

                // Przyciski akcji
                createElement("div", {
                  className: "preset-actions",
                  children: [
                    createElement("a", {
                      className: "btn btn-play",
                      attributes: {
                        href: `#/game/${preset.id}`
                      },
                      text: "▶ Graj"
                    }),

                    createElement("a", {
                      className: "btn btn-edit",
                      attributes: {
                        href: `#/editor/${preset.id}`
                      },
                      text: "✏ Edytuj"
                    }),

                    createElement("button", {
                      className: "btn btn-delete",
                      attributes: {
                        type: "button",
                        "data-preset-action": "delete",
                        "data-preset-id": preset.id
                      },
                      text: "🗑 Usuń"
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

  // Wyświetlenie komunikatu użytkownikowi
  showListMessage(section, message, type = "info") {
    const existingMessage = section.querySelector("[data-view-message]");

    if (existingMessage) {
      existingMessage.remove();
    }

    const alert = createAlert(message, type);
    alert.dataset.viewMessage = "true";

    section.insertBefore(
        alert,
        section.querySelector("[data-preset-list]")
    );
  }

  // Wyświetlenie pustego stanu gdy brak presetów
  toggleEmptyState(section) {
    const list = section.querySelector("[data-preset-list]");

    if (list.children.length > 0) {
      return;
    }

    section.appendChild(
        createEmptyState(
            "Brak presetów",
            "Dodaj pierwszy preset, żeby rozpocząć testowanie gry."
        )
    );
  }
}