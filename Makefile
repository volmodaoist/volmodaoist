.PHONY: dev build clean

build:
	@echo "Compiling TypeScript..."
	@npm run build || npx tsc

dev: build
	@echo "Starting local dev server at http://localhost:8000"
	@python3 -m http.server 8000 || python -m SimpleHTTPServer 8000

clean:
	@echo "Cleaning compiled js files..."
	@rm -rf static/js/dist
