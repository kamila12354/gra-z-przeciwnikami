import { createElement, createEmptyState, createPageHeader } from "./dom.js";

export class StatsView {
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
        createEmptyState(
          "Brak zapisanych rozgrywek",
          "Statystyki zostaną dodane po pierwszej wygranej albo przegranej partii."
        )
      ]
    });

    section.querySelector("h1").id = "stats-title";

    return section;
  }
}

