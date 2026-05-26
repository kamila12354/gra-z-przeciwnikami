import { Game } from "../game/Game.js";
import { createElement, createPageHeader } from "./dom.js";

export class GameView {
  constructor({ presetId, preset, statsService }) {
    this.presetId = presetId;
    this.preset = preset;
    this.statsService = statsService;
  }

  render() {
    if (!this.preset) {
      return this.createMissingPresetView();
    }

    const section = createElement("section", {
      attributes: {
        "aria-labelledby": "game-title"
      },
      children: [
        createPageHeader(
          this.preset.name,
          "Poruszaj graczem przy pomocy WASD, strzałek albo przycisków mobilnych."
        ),
        this.createHud(),
        this.createBoardContainer(),
        this.createMobileControls()
      ]
    });

    section.querySelector("h1").id = "game-title";

    const game = new Game({
      preset: this.preset,
      root: section,
      statsService: this.statsService
    });

    section.destroy = () => game.destroy();
    requestAnimationFrame(() => game.start());

    return section;
  }

  createHud() {
    const hudItems = [
      ["coins", "Monety", `0 / ${this.preset.coins.length}`],
      ["moves", "Ruchy", "0"],
      ["time", "Czas", "00:00"],
      ["status", "Status", "Gotowe"]
    ];

    return createElement("section", {
      className: "row g-3 mb-4",
      attributes: {
        "aria-label": "Panel gry"
      },
      children: hudItems.map(([name, label, value]) => createElement("article", {
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
                    attributes: {
                      "data-hud-value": name
                    },
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

  createBoardContainer() {
    return createElement("div", {
      className: "mb-4",
      attributes: {
        "data-game-board": "true"
      }
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
        "aria-label": "Sterowanie mobilne",
        "data-mobile-controls": "true"
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

  createMissingPresetView() {
    return createElement("section", {
      className: "py-5",
      attributes: {
        "aria-labelledby": "missing-preset-title"
      },
      children: [
        createElement("h1", {
          className: "h3 mb-3",
          id: "missing-preset-title",
          text: "Nie znaleziono presetu"
        }),
        createElement("p", {
          className: "text-body-secondary",
          text: `Preset o identyfikatorze ${this.presetId} nie istnieje albo został usunięty.`
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
}
