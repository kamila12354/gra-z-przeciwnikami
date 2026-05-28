export class Enemy {
  constructor(config) {//przyjmuje konfiguracje przeciwnika
    this.id = config.id || crypto.randomUUID();//id przeciwnika
    this.type = config.type;//typ przeciwnika
    this.speed = Number(config.speed) || 1;//szybkosc jesli brak wartosci ustawia 1
    this.intelligence = Number(config.intelligence) || 1;//poziom inteligencji
    this.position = { ...config.start };//pozyc ja
    this.energy = 0; // Tworzy licznik energii używany do wykonywania akcji
  }

  update(context) {
    return this.move(context); //wywolije metode ruchu
  }

  move() {
    return {
      nextPosition: this.getPosition()
    };
  }

  getPosition() {
    return { ...this.position };
  }

  setPosition(position) {
    this.position = { ...position };
  }

  canAct() {
    //czy przeciwknik moze wykonac akcje
    this.energy += Math.max(this.speed, 1);
    //dodanie energi zaleznie od szybkosci min 1

    if (this.energy < 3) {
      return false;
      //jesli za malo nie wykona ruchu
    }

    this.energy = 0;
    return true;
    //resetuj energie po wykonaniu akcji
  }

  getAvailableMoves(collisionService) {
    //pobiera mozliwe ruchy przeciwnika
    const directions = [
      { x: 0, y: -1 },//gora
      { x: 1, y: 0 },//prawo
      { x: 0, y: 1 },//dol
      { x: -1, y: 0 }//lewo
    ];

    return directions
      .map((direction) => ({
        //tworzy nowe pozycje dla kazdego kierunku
        x: this.position.x + direction.x,
        y: this.position.y + direction.y
      }))
      .filter((position) => collisionService.canMoveTo(position));//zostawia pola na ktore mozna wejsc
  }

  chooseRandomMove(collisionService) {
    const moves = this.getAvailableMoves(collisionService);

    if (moves.length === 0) {
      return this.getPosition();
      //jesli brak ruchu zostaje w miejscu
    }

    return moves[Math.floor(Math.random() * moves.length)];//zwraca losowy ruch
  }

  calculateDistance(firstPosition, secondPosition) {//oblicza odleglosc miedzy dwoma punktami
    return Math.abs(firstPosition.x - secondPosition.x) + Math.abs(firstPosition.y - secondPosition.y);
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      speed: this.speed,
      intelligence: this.intelligence,
      start: this.getPosition()
    };
  }
}
