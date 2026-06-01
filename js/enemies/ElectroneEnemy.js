import { Enemy } from "./Enemy.js";

export class ElectroneEnemy extends Enemy {
  constructor(config) {
    super({
      ...config,
      type: "electrone" // typ przeciwnika
    });

    this.charge = 0; // licznik tur wykorzystywany do sterowania ruchem
  }

  update({ board, collisionService, playerPosition }) {
    this.charge += 1; // zwiększenie licznika przy każdej aktualizacji

    // Określa czy przeciwnik ma się poruszyć.
    // Im większa szybkość (speed), tym częściej wykonuje ruch.
    // Math.max zabezpiecza przed uzyskaniem wartości mniejszej niż 2.
    const shouldMove = this.charge % Math.max(2, 6 - this.speed) === 0;

    if (shouldMove) {
      // Wybór losowego poprawnego ruchu i aktualizacja pozycji
      this.setPosition(this.chooseRandomMove(collisionService));
    }

    // Zasięg ataku elektrycznego zależny od inteligencji przeciwnika.
    // Minimalny zasięg = 2, maksymalny = 6 pól.
    const range = Math.min(Math.max(this.intelligence, 2), 6);

    // Sprawdzenie czy gracz znajduje się w zasięgu przeciwnika
    const isPlayerInRange =
        this.calculateDistance(this.position, playerPosition) <= range;

    return {
      // Aktualna pozycja przeciwnika
      nextPosition: this.getPosition(),

      // Jeśli gracz jest w zasięgu, generowane są pola elektryczne,
      // w przeciwnym razie zwracana jest pusta tablica
      electricZones: isPlayerInRange
          ? this.createElectricZones(board, range)
          : []
    };
  }

  createElectricZones(board, range) {
    const zones = [];

    // Tworzenie pól rażenia w pionie i poziomie
    // wokół przeciwnika w zadanym zasięgu
    for (let offset = -range; offset <= range; offset += 1) {

      // Pole w poziomie względem przeciwnika
      const horizontal = {
        x: this.position.x + offset,
        y: this.position.y
      };

      // Pole w pionie względem przeciwnika
      const vertical = {
        x: this.position.x,
        y: this.position.y + offset
      };

      // Dodanie pola poziomego jeśli:
      // - znajduje się na planszy
      // - nie jest ścianą
      if (board.isInside(horizontal) && !board.hasWallAt(horizontal)) {
        zones.push(horizontal);
      }

      // Dodanie pola pionowego jeśli:
      // - znajduje się na planszy
      // - nie jest ścianą
      if (board.isInside(vertical) && !board.hasWallAt(vertical)) {
        zones.push(vertical);
      }
    }

    // Zwraca wszystkie pola objęte atakiem elektrycznym
    return zones;
  }
}