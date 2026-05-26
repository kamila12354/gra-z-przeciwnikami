const PRESETS_KEY = "mazeEnemiesGame.presets";
const STATS_KEY = "mazeEnemiesGame.stats";

export class StorageService {
  constructor({ defaultPresetsUrl = "data/default-presets.json" } = {}) {
    this.defaultPresetsUrl = defaultPresetsUrl;
  }

  async loadAppData() {
    const [presets, stats] = await Promise.all([
      this.getPresets(),
      this.getStats()
    ]);

    return { presets, stats };
  }

  async getPresets() {
    const storedPresets = this.readJson(PRESETS_KEY, null);

    if (Array.isArray(storedPresets) && storedPresets.length > 0) {
      return storedPresets;
    }

    const defaultPresets = await this.fetchDefaultPresets();
    await this.savePresets(defaultPresets);
    return defaultPresets;
  }

  async savePresets(presets) {
    if (!Array.isArray(presets)) {
      throw new Error("Lista presetów ma niepoprawny format.");
    }

    this.writeJson(PRESETS_KEY, presets);
    return presets;
  }

  async deletePreset(presetId) {
    const presets = await this.getPresets();
    const filteredPresets = presets.filter((preset) => preset.id !== presetId);
    await this.savePresets(filteredPresets);
    return filteredPresets;
  }

  async getStats() {
    const stats = this.readJson(STATS_KEY, []);

    if (!Array.isArray(stats)) {
      return [];
    }

    return stats;
  }

  async saveStats(stats) {
    if (!Array.isArray(stats)) {
      throw new Error("Lista statystyk ma niepoprawny format.");
    }

    this.writeJson(STATS_KEY, stats);
    return stats;
  }

  async fetchDefaultPresets() {
    const response = await fetch(this.defaultPresetsUrl);

    if (!response.ok) {
      throw new Error(`Nie udało się pobrać presetów. Kod HTTP: ${response.status}.`);
    }

    const presets = await response.json();

    if (!Array.isArray(presets)) {
      throw new Error("Plik z presetami nie zawiera listy map.");
    }

    return presets;
  }

  readJson(key, fallbackValue) {
    try {
      const rawValue = localStorage.getItem(key);

      if (rawValue === null) {
        return fallbackValue;
      }

      return JSON.parse(rawValue);
    } catch (error) {
      localStorage.removeItem(key);
      return fallbackValue;
    }
  }

  writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      throw new Error("Nie udało się zapisać danych w localStorage.");
    }
  }
}

