export class Enemy {
  constructor(config) {
    this.id = config.id || crypto.randomUUID();
    this.type = config.type;
    this.speed = Number(config.speed) || 1;
    this.intelligence = Number(config.intelligence) || 1;
    this.position = { ...config.start };
    this.energy = 0;
  }

  update(context) {
    return this.move(context);
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

  canAct() { //czy przeciwknik moze wykonac ruch
    this.energy += Math.max(this.speed, 1); //dodanie energi zaleznie od szybkosci min 1

    if (this.energy < 3) {//czy zgormadzono wystarczajaco ilosc energi
      return false;
      //jesli za malo energi nie wykona ruchu
    }

    this.energy = 0; //zeruje po wykonaniu ruchu
    return true;
    //pozwala wykonac ruch
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
      .map((direction) => ({//zmienia kierunki na konkretne pozycje
        x: this.position.x + direction.x,//nowy x
        y: this.position.y + direction.y//nowy y
      }))
      .filter((position) => collisionService.canMoveTo(position));//przyklad filter() zostawia pola na ktore mozna wejsc
  }

  chooseRandomMove(collisionService) {//wybiera losowy ruch
    const moves = this.getAvailableMoves(collisionService);//pobiera wszystkie mozliwe ruchy

    if (moves.length === 0) {//sprawdza czy istnieje jakis ruch
      return this.getPosition();//pozostaje na obecnym mijscu
    }

    return moves[Math.floor(Math.random() * moves.length)];//losuje jeden dostepny ruch
  }

  calculateDistance(firstPosition, secondPosition) {//przyklad pure functions() oblicza odleglosc miedzy dwoma punktami
    return Math.abs(firstPosition.x - secondPosition.x) + Math.abs(firstPosition.y - secondPosition.y);
  }
}
