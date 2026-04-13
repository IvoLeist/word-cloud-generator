SHELL := /bin/sh

.PHONY: help worktrees tree-dev

help:
	@printf '%s\n' \
		'Available targets:' \
		'  make dev		     Run npm run dev for the main branch' \
		'  make worktrees            List git worktrees for this repo' \
		'  make tree-dev                  Pick a worktree branch and run npm run dev' \
		'  make tree-dev BRANCH=<name>    Run npm run dev for a specific branch'

dev:
	@npm run dev

worktrees:
	@git worktree list

tree-dev:
	@set -eu; \
	data_file="$$(mktemp)"; \
	trap 'rm -f "$$data_file"' EXIT HUP INT TERM; \
	git worktree list --porcelain | awk '\
		/^worktree / { path = substr($$0, 10) } \
		/^branch / { \
			branch = $$2; \
			sub(/^refs\/heads\//, "", branch); \
			print branch "\t" path; \
		} \
	' > "$$data_file"; \
	if [ ! -s "$$data_file" ]; then \
		echo "No git worktrees found."; \
		exit 1; \
	fi; \
	branch_input="$${BRANCH:-}"; \
	if [ -n "$$branch_input" ]; then \
		selection_line="$$(awk -F '\t' -v branch="$$branch_input" '$$1 == branch { print; exit }' "$$data_file")"; \
		if [ -z "$$selection_line" ]; then \
			echo "Unknown branch: $$branch_input"; \
			echo ""; \
			$(MAKE) worktrees; \
			exit 1; \
		fi; \
	else \
		echo "Select a worktree to run npm run dev:"; \
		awk -F '\t' '{ printf "  [%d] %s\n      %s\n", NR, $$1, $$2 }' "$$data_file"; \
		printf 'Enter selection: '; \
		read -r selection; \
		selection_line="$$(awk -F '\t' -v idx="$$selection" 'NR == idx { print; exit }' "$$data_file")"; \
		if [ -z "$$selection_line" ]; then \
			echo "Invalid selection: $$selection"; \
			exit 1; \
		fi; \
	fi; \
	selected_branch="$${selection_line%%	*}"; \
	selected_path="$${selection_line#*	}"; \
	echo "Running npm run dev for $$selected_branch"; \
	echo "Path: $$selected_path"; \
	cd "$$selected_path" && npm run dev