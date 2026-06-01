const PRESETS_KEY = "mazeEnemiesGame.presets"; // klucz do przechowywania presetów w localStorage
const STATS_KEY = "mazeEnemiesGame.stats"; // klucz do przechowywania statystyk

export class StorageService { // obsługa zapisu i odczytu danych aplikacji

  constructor({ defaultPresetsUrl = "data/default-presets.json" } = {}) {
    // ścieżka do pliku z domyślnymi mapami
    this.defaultPresetsUrl = defaultPresetsUrl;
  }

  async loadAppData() {
    // jednoczesne wczytanie presetów i statystyk
    const [presets, stats] = await Promise.all([
      this.getPresets(),
      this.getStats()
    ]);

    return { presets, stats };
  }

  async getPresets() {
    // próba pobrania zapisanych map z localStorage
    const storedPresets = this.readJson(PRESETS_KEY, null);

    if (Array.isArray(storedPresets) && storedPresets.length > 0) {
      return storedPresets;
    }

    // jeśli brak zapisanych map, pobiera domyślne
    const defaultPresets = await this.fetchDefaultPresets();
    await this.savePresets(defaultPresets);

    return defaultPresets;
  }

  async savePresets(presets) {
    // zapis presetów do localStorage
    if (!Array.isArray(presets)) {
      throw new Error("Lista presetów ma niepoprawny format.");
    }

    this.writeJson(PRESETS_KEY, presets);
    return presets;
  }

  async deletePreset(presetId) {
    // usunięcie wybranego presetu
    const presets = await this.getPresets();

    const filteredPresets = presets.filter(
        (preset) => preset.id !== presetId
    );

    await this.savePresets(filteredPresets);

    return filteredPresets;
  }

  async getStats() {
    // pobranie zapisanych statystyk
    const stats = this.readJson(STATS_KEY, []);

    if (!Array.isArray(stats)) {
      return [];
    }

    return stats;
  }

  async saveStats(stats) {
    // zapis statystyk do localStorage
    if (!Array.isArray(stats)) {
      throw new Error("Lista statystyk ma niepoprawny format.");
    }

    this.writeJson(STATS_KEY, stats);

    return stats;
  }

  async fetchDefaultPresets() {
    // pobranie domyślnych map z pliku JSON
    const response = await fetch(this.defaultPresetsUrl);

    if (!response.ok) {
      throw new Error(`Nie udało się pobrać presetów. Kod HTTP: ${response.status}.`);
    }

    // zamiana odpowiedzi JSON na obiekty JavaScript
    const presets = await response.json();

    if (!Array.isArray(presets)) {
      throw new Error("Plik z presetami nie zawiera listy map.");
    }

    return presets;
  }

  readJson(key, fallbackValue) {
    // odczyt danych JSON z localStorage
    try {
      const rawValue = localStorage.getItem(key);

      if (rawValue === null) {
        return fallbackValue;
      }

      return JSON.parse(rawValue);
    } catch (error) {
      // usunięcie uszkodzonych danych
      localStorage.removeItem(key);

      return fallbackValue;
    }
  }

  writeJson(key, value) {
    // zapis danych do localStorage
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      throw new Error("Nie udało się zapisać danych w localStorage.");
    }
  }
}