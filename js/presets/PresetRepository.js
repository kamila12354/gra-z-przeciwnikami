export class PresetRepository {
  constructor(storageService) {
    // Serwis odpowiedzialny za zapis i odczyt presetów
    this.storageService = storageService;

    // Lokalna lista dostępnych presetów
    this.presets = [];
  }

  setPresets(presets) {
    // Aktualizacja listy presetów
    this.presets = [...presets];
  }

  getAll() {
    // Zwraca kopię wszystkich presetów
    return [...this.presets];
  }

  findById(presetId) {
    // Wyszukanie presetu po identyfikatorze
    return this.presets.find((preset) => preset.id === presetId) || null;
  }

  async save(preset) {
    // Dodanie nowego presetu lub aktualizacja istniejącego

    const existingIndex = this.presets.findIndex(
        (currentPreset) => currentPreset.id === preset.id
    );

    if (existingIndex >= 0) {
      this.presets = this.presets.map((currentPreset) =>
          currentPreset.id === preset.id ? preset : currentPreset
      );
    } else {
      this.presets = [...this.presets, preset];
    }

    // Zapis zmian w pamięci trwałej
    await this.storageService.savePresets(this.presets);

    return preset;
  }

  async deleteById(presetId) {
    // Usunięcie presetu na podstawie identyfikatora
    this.presets = await this.storageService.deletePreset(presetId);

    return this.getAll();
  }
}