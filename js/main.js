import { Router } from "./router.js";
import { EditorView } from "./ui/EditorView.js";
import { GameView } from "./ui/GameView.js";
import { PresetListView } from "./ui/PresetListView.js";
import { StatsView } from "./ui/StatsView.js";

const app = document.querySelector("#app");
const navLinks = document.querySelectorAll("[data-route-link]");

const routes = [
  {
    pattern: /^#\/presets$/,
    render: () => new PresetListView().render(),
    title: "Presety"
  },
  {
    pattern: /^#\/game\/(?<presetId>[\w-]+)$/,
    render: (params) => new GameView(params).render(),
    title: "Gra"
  },
  {
    pattern: /^#\/editor$/,
    render: () => new EditorView().render(),
    title: "Edytor"
  },
  {
    pattern: /^#\/editor\/(?<presetId>[\w-]+)$/,
    render: (params) => new EditorView(params).render(),
    title: "Edycja presetu"
  },
  {
    pattern: /^#\/stats$/,
    render: () => new StatsView().render(),
    title: "Statystyki"
  }
];

const router = new Router({
  app,
  defaultRoute: "#/presets",
  navLinks,
  routes
});

document.addEventListener("DOMContentLoaded", () => {
  router.start();
});

