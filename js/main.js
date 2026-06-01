import { Router } from "./router.js";
import { PresetRepository } from "./presets/PresetRepository.js";
import { StatsService } from "./stats/StatsService.js";
import { StorageService } from "./storage/StorageService.js";
import { EditorView } from "./ui/EditorView.js";
import { GameView } from "./ui/GameView.js";
import { PresetListView } from "./ui/PresetListView.js";
import { StatsView } from "./ui/StatsView.js";
import { createErrorView, createLoadingView } from "./ui/dom.js";

// Pobranie głównych elementów interfejsu
const app = document.querySelector("#app"); //szuka elemntu sluzy to wyszukania elemntow html przy uzyciu selektorow css
const navLinks = document.querySelectorAll("[data-route-link]");

// Inicjalizacja głównych serwisów aplikacji
const storageService = new StorageService();
const presetRepository = new PresetRepository(storageService);
const statsService = new StatsService(storageService);

// Definicja tras aplikacji SPA
const routes = [
  {
    pattern: /^#\/presets$/,
    render: () => new PresetListView({
      presetRepository
    }).render(),
    title: "Presety"
  },

  {
    pattern: /^#\/game\/(?<presetId>[\w-]+)$/,
    render: (params) => new GameView({
      ...params,
      preset: presetRepository.findById(params.presetId),
      statsService
    }).render(),
    title: "Gra"
  },

  {
    pattern: /^#\/editor$/,
    render: () => new EditorView({
      presetRepository,
      presets: presetRepository.getAll()
    }).render(),
    title: "Edytor"
  },

  {
    pattern: /^#\/editor\/(?<presetId>[\w-]+)$/,
    render: (params) => new EditorView({
      ...params,
      presetRepository,
      preset: presetRepository.findById(params.presetId),
      presets: presetRepository.getAll()
    }).render(),
    title: "Edycja presetu"
  },

  {
    pattern: /^#\/stats$/,
    render: () => new StatsView({
      statsService
    }).render(),
    title: "Statystyki"
  }
];

// Utworzenie routera odpowiedzialnego za nawigację
const router = new Router({
  app,
  defaultRoute: "#/presets",
  navLinks,
  routes
});

// Uruchomienie aplikacji po załadowaniu strony
document.addEventListener("DOMContentLoaded", async () => {

  // Wyświetlenie ekranu ładowania
  app.replaceChildren(createLoadingView());

  try {

    // Wczytanie danych aplikacji
    const { presets, stats } = await storageService.loadAppData();

    // Przekazanie danych do repozytoriów
    presetRepository.setPresets(presets);
    statsService.setStats(stats);

    // Start routera i aplikacji
    router.start();

  } catch (error) {

    // Wyświetlenie błędu uruchomienia aplikacji
    app.replaceChildren(createErrorView(error.message));
  }
});