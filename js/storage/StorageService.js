const PRESETS_KEY = "mazeEnemiesGame.presets";//klucz do przechowywania presetow w localStorage
const STATS_KEY = "mazeEnemiesGame.stats";//do statystyk

export class StorageService {//zapis i odczyt danych
  constructor({ defaultPresetsUrl = "data/default-presets.json" } = {}) {//domyslna sciezka pliku z mapami
    this.defaultPresetsUrl = defaultPresetsUrl;
  }

  async loadAppData() {//wczytuje dane aplikacji
    const [presets, stats] = await Promise.all([
      this.getPresets(),
      this.getStats()
    ]);

    return { presets, stats };
  }

  async getPresets() {//pobiera presety map
    const storedPresets = this.readJson(PRESETS_KEY, null);//odczytuje presety z localstorage

    if (Array.isArray(storedPresets) && storedPresets.length > 0) {//czy istnieja zapisane mapy
      return storedPresets;
    }

    const defaultPresets = await this.fetchDefaultPresets();//pobiera domyslne mapy
    await this.savePresets(defaultPresets);//zapisuje
    return defaultPresets;
  }

  async savePresets(presets) {//zapisuje presety
    if (!Array.isArray(presets)) {//czy przekazano tablice
      throw new Error("Lista presetów ma niepoprawny format.");
    }

    this.writeJson(PRESETS_KEY, presets);//zapisuje dane do localstorage
    return presets;
  }

  async deletePreset(presetId) {//usuwa presety o podanym id
    const presets = await this.getPresets();
    const filteredPresets = presets.filter((preset) => preset.id !== presetId);//usuwa wybrany preset
    await this.savePresets(filteredPresets);
    return filteredPresets;//zwraca liste po usunieciu
  }

  async getStats() {
    const stats = this.readJson(STATS_KEY, []);

    if (!Array.isArray(stats)) {//sprawdza poprawnosc danych
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

  async fetchDefaultPresets() {//pobiera domysle mapy z pliku json
    const response = await fetch(this.defaultPresetsUrl);//wysyla zadanie http

    if (!response.ok) {//czy pobieranie zakonczylo sie sukcesem
      throw new Error(`Nie udało się pobrać presetów. Kod HTTP: ${response.status}.`);
    }

    const presets = await response.json();//zmienia odpowiedzi json na obiekt js

    if (!Array.isArray(presets)) {//czy plik zwiera tablice map
      throw new Error("Plik z presetami nie zawiera listy map.");
    }

    return presets;
  }

  readJson(key, fallbackValue) {//odczytuje dane json z localStorage
    try {
      const rawValue = localStorage.getItem(key);//pobiera tekst

      if (rawValue === null) {//czy dane istnieja
        return fallbackValue;//jesli nie istnieje zwraca wartosc domysla
      }

      return JSON.parse(rawValue);//zmienia tekst json na obiekt js
    } catch (error) {//gdy dane uszkodzone
      localStorage.removeItem(key);//usuwa niepoprawne dane
      return fallbackValue;//wartosc domyslna
    }
  }

  writeJson(key, value) {//zapisuje dane do localStorage
    try {
      localStorage.setItem(key, JSON.stringify(value));//zmienia obiekt na json i zapisuje go
    } catch (error) {
      throw new Error("Nie udało się zapisać danych w localStorage.");
    }
  }
}

