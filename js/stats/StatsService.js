export class StatsService {
  constructor(storageService) {
    this.storageService = storageService;
    this.stats = [];
  }

  setStats(stats) {
    this.stats = [...stats];
  }

  getAll() {
    return [...this.stats];
  }

  async addResult(result) {
    const entry = {
      id: crypto.randomUUID(),
      finishedAt: new Date().toISOString(),
      ...result
    };

    this.stats = [entry, ...this.stats];
    await this.storageService.saveStats(this.stats);
    return entry;
  }
}

