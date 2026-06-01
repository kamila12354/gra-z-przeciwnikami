import { ElectroneEnemy } from "./ElectroneEnemy.js";
import { LavaEnemy } from "./LavaEnemy.js";
import { NormalEnemy } from "./NormalEnemy.js";

export function createEnemy(config) {
  if (config.type === "lava") {
    return new LavaEnemy(config);
  }

  if (config.type === "electrone") {
    return new ElectroneEnemy(config);
  }

  return new NormalEnemy(config);
}

