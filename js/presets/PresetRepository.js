export class PresetRepository {
  constructor(storageService) {
    this.storageService = storageService;
    this.presets = [];
  }

  setPresets(presets) {
    this.presets = [...presets];
  }

  getAll() {
    return [...this.presets];
  }

  findById(presetId) {
    return this.presets.find((preset) => preset.id === presetId) || null;
  }

  async deleteById(presetId) {
    this.presets = await this.storageService.deletePreset(presetId);
    return this.getAll();
  }
}

