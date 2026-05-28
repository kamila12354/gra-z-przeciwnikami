# PROJEKT.md

## Temat

Projekt 5 - Gra z Przeciwnikami.

## Opis

Aplikacja będzie grą labiryntową działającą w przeglądarce. Gracz będzie poruszał się po planszy, zbierał monety, unikał przeciwników i korzystał z presetów map. Projekt będzie zawierał edytor presetów, listę przeciwników oraz ekran statystyk.

## Wymagania techniczne

1. Kod podzielony na moduły ES6 z użyciem `import` i `export`.
2. Minimum kilka klas o jasno rozdzielonych odpowiedzialnościach.
3. Obsługa zdarzeń przez `addEventListener`.
4. Brak inline-handlerów w HTML.
5. Manipulacja DOM przez natywne API.
6. Obsługa asynchroniczna przez `fetch`, `async/await`, Promises i `Promise.all`.
7. Dane zapisywane w localStorage.
8. Responsywny interfejs z Bootstrapem.
9. Dokumentacja w README.

## Planowana struktura

```text
index.html
README.md
PROJEKT.md
.gitignore
css/
  styles.css
data/
  default-presets.json
js/
  main.js
  router.js
  storage/
  game/
  enemies/
  presets/
  stats/
  ui/
assets/
  screenshots/
```

## Etapy

1. Przygotowanie struktury projektu - gotowe.
2. Routing i podstawowe widoki - gotowe.
3. Storage, dane domyślne i operacje asynchroniczne - gotowe.
4. Plansza, gracz i kolizje - gotowe.
5. Monety i HUD - gotowe.
6. Przeciwnicy - gotowe.
7. Formularz i lista przeciwników - gotowe.
8. Edytor presetów.
9. Statystyki rozgrywek.
10. Responsywność, błędy i dopracowanie UI.
11. README, screenshoty i przygotowanie do obrony.
