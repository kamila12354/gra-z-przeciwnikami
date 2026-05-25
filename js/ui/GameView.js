import { createElement, createPageHeader } from "./dom.js";

export class GameView {
  constructor({ presetId }) {
    this.presetId = presetId;
  }

  render() {
    const section = createElement("section", {
      attributes: {
        "aria-labelledby": "game-title"
      },
      children: [
        createPageHeader(
          "Gra",
          `Widok rozgrywki dla presetu: ${this.presetId}. Logika planszy pojawi się w kolejnym etapie.`
        ),
        this.createHud(),
        this.createBoardPlaceholder(),
        this.createMobileControls()
      ]
    });

    section.querySelector("h1").id = "game-title";

    return section;
  }

  createHud() {
    const hudItems = [
      ["Monety", "0 / 0"],
      ["Ruchy", "0"],
      ["Czas", "00:00"],
      ["Status", "Gotowe"]
    ];

    return createElement("section", {
      className: "row g-3 mb-4",
      attributes: {
        "aria-label": "Panel gry"
      },
      children: hudItems.map(([label, value]) => createElement("article", {
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

  createBoardPlaceholder() {
    const cells = Array.from({ length: 48 }, (_, index) => createElement("div", {
      className: index % 7 === 0 ? "board-cell board-cell-wall" : "board-cell",
      attributes: {
        "aria-hidden": "true"
      }
    }));

    return createElement("section", {
      className: "game-board-preview mb-4",
      attributes: {
        "aria-label": "Podgląd planszy"
      },
      children: cells
    });
  }

  createMobileControls() {
    const controls = [
      ["up", "Góra"],
      ["left", "Lewo"],
      ["down", "Dół"],
      ["right", "Prawo"]
    ];

    return createElement("section", {
      className: "mobile-controls d-grid gap-2",
      attributes: {
        "aria-label": "Sterowanie mobilne"
      },
      children: controls.map(([direction, label]) => createElement("button", {
        className: "btn btn-outline-secondary",
        attributes: {
          type: "button",
          "data-direction": direction
        },
        text: label
      }))
    });
  }
}

