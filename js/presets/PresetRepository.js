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

  async save(preset) {
    const existingIndex = this.presets.findIndex((currentPreset) => currentPreset.id === preset.id);

    if (existingIndex >= 0) {
      this.presets = this.presets.map((currentPreset) => (
        currentPreset.id === preset.id ? preset : currentPreset
      ));
    } else {
      this.presets = [...this.presets, preset];
    }

    await this.storageService.savePresets(this.presets);
    return preset;
  }

  async deleteById(presetId) {
    this.presets = await this.storageService.deletePreset(presetId);
    return this.getAll();
  }
}
