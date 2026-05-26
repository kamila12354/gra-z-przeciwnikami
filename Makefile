PORT ?= 8001
PYTHON ?= python3

.PHONY: help serve check check-js check-json

help:
	@echo "Dostepne komendy:"
	@echo "  make serve      - uruchamia lokalny serwer HTTP"
	@echo "  make check      - sprawdza skladnie JS i poprawnosc JSON"
	@echo "  make check-js   - sprawdza skladnie plikow JavaScript"
	@echo "  make check-json - sprawdza plik data/default-presets.json"
	@echo ""
	@echo "Port mozna zmienic tak: make serve PORT=8002"

serve:
	$(PYTHON) -m http.server $(PORT)

check: check-js check-json

check-js:
	@for file in js/*.js js/ui/*.js js/storage/*.js js/presets/*.js js/stats/*.js js/game/*.js; do \
		node --check "$$file"; \
	done

check-json:
	@node -e "JSON.parse(require('fs').readFileSync('data/default-presets.json', 'utf8')); console.log('JSON OK')"

