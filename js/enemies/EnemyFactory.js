import { ElectroneEnemy } from "./ElectroneEnemy.js";
import { LavaEnemy } from "./LavaEnemy.js";
import { NormalEnemy } from "./NormalEnemy.js";

export function createEnemy(config) {
  //funkcja tworzy przeciwnika
  if (config.type === "lava") {//czy typ to lava
    return new LavaEnemy(config);//tworzy i zwraca przeciwnika lava
  }

  if (config.type === "electrone") {//czy typ electrone
    return new ElectroneEnemy(config);//tworzy i zwraca przeciwnika electrone
  }

  return new NormalEnemy(config);//jesli nie pasuje do powyzej to tworzy zwyklego
}

