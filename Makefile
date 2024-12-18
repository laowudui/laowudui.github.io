.PHONY: defaults
defaults: install build

.PHONY: install
install:
	@npm $@ -g pnpm
	@pnpm $@

.PHONY: build
build:
	@pnpm vitepress $@

.PHONY: dev
dev:
	@pnpm vitepress $@

.PHONY: preview
preview:
	@pnpm vitepress $@
