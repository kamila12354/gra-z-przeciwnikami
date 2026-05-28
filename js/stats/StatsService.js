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

  getSummary() {
    return this.stats.reduce((summary, entry) => {
      const isWin = entry.result === "wygrana";

      return {
        games: summary.games + 1,
        wins: summary.wins + (isWin ? 1 : 0),
        losses: summary.losses + (isWin ? 0 : 1),
        coins: summary.coins + Number(entry.collectedCoins || 0),
        moves: summary.moves + Number(entry.moves || 0),
        seconds: summary.seconds + Number(entry.durationSeconds || 0)
      };
    }, {
      games: 0,
      wins: 0,
      losses: 0,
      coins: 0,
      moves: 0,
      seconds: 0
    });
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

  async clearAll() {
    this.stats = [];
    await this.storageService.saveStats(this.stats);
    return this.getAll();
  }
}
