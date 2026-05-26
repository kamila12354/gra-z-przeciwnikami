import { createElement, createEmptyState, createPageHeader } from "./dom.js";

export class StatsView {
  constructor({ stats }) {
    this.stats = stats;
  }

  render() {
    const section = createElement("section", {
      attributes: {
        "aria-labelledby": "stats-title"
      },
      children: [
        createPageHeader(
          "Statystyki",
          "Tutaj pojawi się historia ukończonych rozgrywek zapisana w localStorage."
        ),
      ]
    });

    section.querySelector("h1").id = "stats-title";

    if (this.stats.length === 0) {
      section.appendChild(createEmptyState(
        "Brak zapisanych rozgrywek",
        "Statystyki zostaną dodane po pierwszej wygranej albo przegranej partii."
      ));
      return section;
    }

    section.appendChild(this.createStatsList());

    return section;
  }

  createStatsList() {
    return createElement("div", {
      className: "list-group",
      children: this.stats.map((entry) => createElement("article", {
        className: "list-group-item",
        children: [
          createElement("div", {
            className: "d-flex flex-column flex-md-row justify-content-between gap-2",
            children: [
              createElement("div", {
                children: [
                  createElement("h2", {
                    className: "h6 mb-1",
                    text: entry.presetName || "Nieznany preset"
                  }),
                  createElement("p", {
                    className: "text-body-secondary mb-0",
                    text: `Wynik: ${entry.result || "brak danych"}. Monety: ${entry.collectedCoins || 0}/${entry.totalCoins || 0}. Ruchy: ${entry.moves || 0}. Czas: ${this.formatDuration(entry.durationSeconds || 0)}.`
                  })
                ]
              }),
              createElement("time", {
                className: "text-body-secondary small",
                attributes: {
                  datetime: entry.finishedAt
                },
                text: entry.finishedAt ? new Date(entry.finishedAt).toLocaleString("pl-PL") : "Brak daty"
              })
            ]
          })
        ]
      }))
    });
  }

  formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }
}
