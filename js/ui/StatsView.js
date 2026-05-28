import { createAlert, createElement, createEmptyState, createPageHeader } from "./dom.js";

export class StatsView {
  constructor({ statsService }) {
    this.statsService = statsService;
    this.stats = statsService.getAll();
  }

  render() {
    const clearButton = createElement("button", {
      className: "btn btn-outline-danger",
      attributes: {
        type: "button",
        "data-stats-action": "clear"
      },
      text: "Wyczyść statystyki"
    });

    const section = createElement("section", {
      attributes: {
        "aria-labelledby": "stats-title"
      },
      children: [
        createPageHeader(
          "Statystyki",
          "Historia ukończonych rozgrywek zapisana w localStorage.",
          [clearButton]
        )
      ]
    });

    section.querySelector("h1").id = "stats-title";
    section.addEventListener("click", (event) => this.handleStatsClick(event, section));
    this.renderStatsContent(section);

    return section;
  }

  renderStatsContent(section) {
    section.querySelector("[data-stats-content]")?.remove();

    const content = createElement("div", {
      attributes: {
        "data-stats-content": "true"
      }
    });

    if (this.stats.length === 0) {
      content.appendChild(createEmptyState(
        "Brak zapisanych rozgrywek",
        "Statystyki zostaną dodane po pierwszej wygranej albo przegranej partii."
      ));
      section.appendChild(content);
      return;
    }

    content.appendChild(this.createSummary());
    content.appendChild(this.createStatsList());
    section.appendChild(content);
  }

  createSummary() {
    const summary = this.statsService.getSummary();
    const averageTime = summary.games > 0 ? Math.round(summary.seconds / summary.games) : 0;
    const summaryItems = [
      ["Rozgrywki", String(summary.games)],
      ["Wygrane", String(summary.wins)],
      ["Przegrane", String(summary.losses)],
      ["Śr. czas", this.formatDuration(averageTime)]
    ];

    return createElement("section", {
      className: "row g-3 mb-4",
      attributes: {
        "aria-label": "Podsumowanie statystyk"
      },
      children: summaryItems.map(([label, value]) => createElement("article", {
        className: "col-6 col-lg-3",
        children: [
          createElement("div", {
            className: "card h-100",
            children: [
              createElement("div", {
                className: "card-body py-3",
                children: [
                  createElement("p", {
                    className: "text-body-secondary small mb-1",
                    text: label
                  }),
                  createElement("p", {
                    className: "h5 mb-0",
                    text: value
                  })
                ]
              })
            ]
          })
        ]
      }))
    });
  }

  createStatsList() {
    return createElement("section", {
      attributes: {
        "aria-labelledby": "stats-list-title"
      },
      children: [
        createElement("h2", {
          className: "h5 mb-3",
          id: "stats-list-title",
          text: "Historia gier"
        }),
        createElement("div", {
          className: "list-group",
          children: this.stats.map((entry) => this.createStatsItem(entry))
        })
      ]
    });
  }

  createStatsItem(entry) {
    const detailsId = `stats-details-${entry.id}`;
    const resultClass = entry.result === "wygrana" ? "text-success" : "text-danger";

    return createElement("article", {
      className: "list-group-item",
      children: [
        createElement("div", {
          className: "d-flex flex-column flex-lg-row justify-content-between gap-3",
          children: [
            createElement("div", {
              children: [
                createElement("h3", {
                  className: "h6 mb-1",
                  text: entry.presetName || "Nieznany preset"
                }),
                createElement("p", {
                  className: `mb-1 fw-semibold ${resultClass}`,
                  text: entry.result || "brak danych"
                }),
                createElement("p", {
                  className: "text-body-secondary mb-0",
                  text: `Monety: ${entry.collectedCoins || 0}/${entry.totalCoins || 0}. Ruchy: ${entry.moves || 0}. Czas: ${this.formatDuration(entry.durationSeconds || 0)}.`
                })
              ]
            }),
            createElement("div", {
              className: "d-flex flex-column align-items-lg-end gap-2",
              children: [
                createElement("time", {
                  className: "text-body-secondary small",
                  attributes: {
                    datetime: entry.finishedAt || ""
                  },
                  text: entry.finishedAt ? new Date(entry.finishedAt).toLocaleString("pl-PL") : "Brak daty"
                }),
                createElement("button", {
                  className: "btn btn-outline-secondary btn-sm",
                  attributes: {
                    type: "button",
                    "aria-controls": detailsId,
                    "aria-expanded": "false",
                    "data-stats-action": "toggle-details",
                    "data-details-id": detailsId
                  },
                  text: "Szczegóły"
                })
              ]
            })
          ]
        }),
        this.createDetails(entry, detailsId)
      ]
    });
  }

  createDetails(entry, detailsId) {
    const details = [
      ["Id presetu", entry.presetId || "brak"],
      ["Wynik", entry.result || "brak danych"],
      ["Przyczyna", entry.deathReason || "ukończono mapę"],
      ["Czas", this.formatDuration(entry.durationSeconds || 0)],
      ["Ruchy", String(entry.moves || 0)],
      ["Monety", `${entry.collectedCoins || 0}/${entry.totalCoins || 0}`],
      ["Data", entry.finishedAt ? new Date(entry.finishedAt).toLocaleString("pl-PL") : "Brak daty"]
    ];

    return createElement("dl", {
      className: "stats-details row border-top mt-3 pt-3 d-none",
      attributes: {
        id: detailsId,
        "data-stats-details": "true"
      },
      children: details.flatMap(([label, value]) => [
        createElement("dt", {
          className: "col-5 col-md-3",
          text: label
        }),
        createElement("dd", {
          className: "col-7 col-md-9",
          text: value
        })
      ])
    });
  }

  async handleStatsClick(event, section) {
    const actionButton = event.target.closest("[data-stats-action]");

    if (!actionButton) {
      return;
    }

    if (actionButton.dataset.statsAction === "toggle-details") {
      this.toggleDetails(actionButton);
      return;
    }

    if (actionButton.dataset.statsAction === "clear") {
      await this.clearStats(section);
    }
  }

  toggleDetails(button) {
    const details = document.getElementById(button.dataset.detailsId);

    if (!details) {
      return;
    }

    const isHidden = details.classList.toggle("d-none");
    button.setAttribute("aria-expanded", String(!isHidden));
    button.textContent = isHidden ? "Szczegóły" : "Ukryj";
  }

  async clearStats(section) {
    try {
      this.stats = await this.statsService.clearAll();
      this.showMessage(section, "Statystyki zostały wyczyszczone.", "info");
      this.renderStatsContent(section);
    } catch (error) {
      this.showMessage(section, error.message, "danger");
    }
  }

  showMessage(section, message, type) {
    section.querySelector("[data-stats-message]")?.remove();
    const alert = createAlert(message, type);
    alert.dataset.statsMessage = "true";
    section.querySelector(".page-heading").after(alert);
  }

  formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }
}

