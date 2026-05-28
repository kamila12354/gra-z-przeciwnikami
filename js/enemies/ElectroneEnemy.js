import { Enemy } from "./Enemy.js";

export class ElectroneEnemy extends Enemy {
  constructor(config) {
    super({
      ...config,//kopiuje dane
      type: "electrone"//ustawia typ przeciwnika
    });
    this.charge = 0;//do odmierzenia ruchow
  }

  update({ board, collisionService, playerPosition }) {
    //aktualizacja , przyjmuje plansze system kolizji i pozycje gracza
    this.charge += 1;//zwieksza licznik po aktualizacji

    const shouldMove = this.charge % Math.max(2, 6 - this.speed) === 0;
//czy przeciwnik powinine sie ruszac im wieksza szybkosc tym czesciej sie rusza Math.max-zabezpiecza przed dzieleniem przez liczby<2
    if (shouldMove) {
      this.setPosition(this.chooseRandomMove(collisionService));//wybiera ruch ustawia nowa pozycje
    }

    const range = Math.min(Math.max(this.intelligence, 2), 6);//ustalanie zasiegu ataku eklektrycznefgo
    const isPlayerInRange = this.calculateDistance(this.position, playerPosition) <= range;//obliczanie dystansu miedzy przeciwnikiem a graczem

    return {
      nextPosition: this.getPosition(),//zwraca aktualna pozycje przeciwnika
      electricZones: isPlayerInRange ? this.createElectricZones(board, range) : []//jezeli gracz jest w zasiegu tworzy pola elektryczne jesli nie zwraca pusta tablice
    };
  }

  createElectricZones(board, range) {
    const zones = [];//tablica przechowujaca pola elektryczne

    for (let offset = -range; offset <= range; offset += 1) {
      const horizontal = { x: this.position.x + offset, y: this.position.y };//punkt poziomy
      const vertical = { x: this.position.x, y: this.position.y + offset };//punkt pionowy

      if (board.isInside(horizontal) && !board.hasWallAt(horizontal)) {
        zones.push(horizontal);//czy poziomy jest na plaszy czy nie jest sciana i dodaje
      }

      if (board.isInside(vertical) && !board.hasWallAt(vertical)) {
        zones.push(vertical);//to samo z pionowym
      }
    }

    return zones;//zwraca wszystkie pola elektryczne
  }
}

