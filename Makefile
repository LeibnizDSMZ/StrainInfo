ifeq ($(CONTAINER),container)
$(info Makefile enabled, proceeding ...)
else	
$(error Error: Makefile disabled, exiting ...)
endif

ROOT_MAKEFILE:=$(abspath $(patsubst %/, %, $(dir $(abspath $(lastword $(MAKEFILE_LIST))))))

include $(ROOT_MAKEFILE)/.env

export

include $(ROOT_MAKEFILE)/$(STRINF_BACKEND_ENV)
include $(ROOT_MAKEFILE)/$(STRINF_FRONTEND_ENV)
include $(ROOT_MAKEFILE)/$(STRINF_API_ENV)

export

BUN_DIR=$(HOME)/.bun
BUN_BIN=$(BUN_DIR)/bin
BUN=$(BUN_BIN)/bun

COM_BIN=$(HOME)/.local/bin/composer
COMPOSER_BE=COMPOSER=$(ROOT_MAKEFILE)/$(CONFIG_COMPOSER_BE) $(COM_BIN)

export PATH:=$(PATH):$(ROOT_MAKEFILE)/$(PHP_VENDOR_BE)/bin:$(BUN_BIN)
OLLAMA_MODEL?=gpt-oss:20b

dev: NODE_ENV = development
dev: setupGit setupNode setupComposer postInstall	
	$(COMPOSER_BE) install -d $(ROOT_MAKEFILE)/$(STRINF_BACKEND_SRC)
	$(BUN) install --frozen-lockfile
	$(BUN) run hook

build: NODE_ENV = production
build: setupNode setupComposer postInstall 
	$(COMPOSER_BE) install -d $(ROOT_MAKEFILE)/$(STRINF_BACKEND_SRC) --no-dev
	$(BUN) install --frozen-lockfile

setupGit:
	git config diff.lockb.textconv bun
	git config diff.lockb.binary true
	git config core.editor vim
	git lfs install --force

setupNode:	
	bash $(ROOT_MAKEFILE)/$(BIN_INSTALL_BUN)	

setupComposer:
	bash $(ROOT_MAKEFILE)/$(BIN_INSTALL_COMPOSER)

postInstall: 
	bash $(ROOT_MAKEFILE)/$(BIN_DEPLOY_FIX)

cleanBuild:
	rm -rf $(ROOT_MAKEFILE)/$(PROFILE_DIR)
	rm -rf $(ROOT_MAKEFILE)/$(APP)

clean: cleanBuild
	rm -rf $(ROOT_MAKEFILE)/node_modules
	rm -rf $(ROOT_MAKEFILE)/$(STRINF_API)/node_modules
	rm -rf $(ROOT_MAKEFILE)/$(STRINF_FRONTEND)/node_modules
	rm -rf $(ROOT_MAKEFILE)/$(PHP_VENDOR_BE)
	rm -rf $(ROOT_MAKEFILE)/$(CACHE_DIR)
	rm -rf $(ROOT_MAKEFILE)/$(EXTRA_STYLE)
	rm -rf $(ROOT_MAKEFILE)/$(EXTRA_ASSETS)

uninstall: clean
	[ -f "$(BUN)" ] && $(BUN) pm cache rm || echo "not installed"
	rm -rf $(BUN_DIR)
	rm -f $(COM_BIN)

runAct: 
	echo "exporting environment"
	bash

runChecks: dev
	$(BUN) run lint
	$(BUN) run lint:api
	$(BUN) run lint:dev
	$(BUN) run lint:frontend
	$(BUN) run lint:backend
	$(BUN) run lint:shell
	$(BUN) run lint:prettier

createBuild: NODE_ENV = production
createBuild: cleanBuild
	[ 'true' = "$(STAGE)" ] && bash $(ROOT_MAKEFILE)/$(BIN_BACKEND_CHANGE_PORT) "stage" || echo "NOT STAGE"
	mkdir -p $(ROOT_MAKEFILE)/$(APP_STRINF)
	[ -d $(ROOT_MAKEFILE)/$(EXTRA_STYLE) ] && $(BUN) run build || $(shell echo "FAILED" && exit 1)
	@find $(ROOT_MAKEFILE)/$(APP_STRINF_PUB) -type f -not -name "*.gz" -not -name "index.html" -size +1k -exec gzip -9 -k {} \; -exec bash -c 'for file in "$$@"; do original_size=$$(stat -c %s "$$file"); gzipped_size=$$(stat -c %s "$$file.gz"); threshold=$$((original_size * 95 / 100)); if [ "$$gzipped_size" -ge "$$threshold" ]; then rm "$$file.gz"; fi; done' bash {} +

runBuild: build createBuild	

runStage: STAGE = true
runStage: build createBuild		
	[ -d $(ROOT_MAKEFILE)/$(EXTRA_STYLE) ] && $(BUN) run serve || $(shell echo "FAILED" && exit 1)

runDev: dev
	bash $(ROOT_MAKEFILE)/$(BIN_BACKEND_CHANGE_PORT) "dev"
	$(BUN) run build:api
	[ -d $(ROOT_MAKEFILE)/$(EXTRA_STYLE) ] && $(BUN) run dev || $(shell echo "FAILED" && exit 1)

runProfile: BENCHMARK = true
runProfile: dev createBuild
	[ -d $(ROOT_MAKEFILE)/$(EXTRA_STYLE) ] && $(BUN) run profile || $(shell echo "FAILED" && exit 1)

runUpdate: %: export_% dev

export_runUpdate:
	echo "UPDATE NODE -> $(NODE_ENV)"
	rm -rf bun.lock
	$(BUN) install --lockfile-only --exact --no-cache
	$(BUN) update
	$(BUN) pm cache rm
	echo "UPDATE COMPOSER"
	$(COMPOSER_BE) update -d $(ROOT_MAKEFILE)/$(STRINF_BACKEND_SRC) 
	$(MAKE) clean

runCron: dev
	bash $(ROOT_MAKEFILE)/$(BIN_BACKEND_RUN_CRON)

runTests: STAGE = true
runTests: build createBuild		
	$(BUN) run test || $(shell echo "FAILED" && exit 1)

PROMPT=Generate a commit message in the Conventional Commits 1.0.0 format based on the following git diff. The commit message must: \n\
- Follow this structure: \n\
1. Commit type (e.g., feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert) \n\
2. Optional scope in parentheses (e.g., feat(auth):) \n\
3. A brief, lowercase description in present tense on the first line \n\
4. Optional body with detailed explanation (can use uppercase) \n\
5. Optional footer(s) with breaking changes, issue references (e.g., Closes \#123), or co-authors (e.g., Co-authored-by: Name) \n\
- Formatting rules: \n\
1. The first line must be entirely lowercase \n\
2. Body and footer may use uppercase letters \n\
3. Follow Conventional Commits 1.0.0 strictly \n\
4. Return only the commit message as plain text (no extra formatting, no markdown) \n\
5. Do NOT mention - no breaking changes \n\
6. Body lines must not be longer than 100 characters \n\
- Example: \n\
feat(auth): add user login API\n\
\n\
Added support for user login via OAuth2. This allows users to authenticate\n\
using their Google account.\n\
\n\
Closes \#42\n\


message:
	@if [ -z "$(COMMIT_MSG_FILE)" ]; then \
		echo "Error: COMMIT_MSG_FILE is not set"; \
		exit 1; \
	fi
	git diff --staged -- . ':(exclude)*bun.lock' ':(exclude)*composer.lock'| \
		jq -Rs --arg prompt "$(PROMPT)" '{"stream": false, "model": "$(OLLAMA_MODEL)", "prompt": (" <GIT_DIFF> " + . + " </GIT_DIFF> " + $$prompt)}' | \
		curl -s -X POST http://ollama:11434/api/generate \
			-H "Content-Type: application/json" \
			-d @- | \
		jq -r 'select(.done == true) | .response' > $(COMMIT_MSG_FILE)
	vim $(COMMIT_MSG_FILE)
	sed -i 's/^[ \t]*//; s/[ \t]*$$//' $(COMMIT_MSG_FILE)
	@if [ -s $(COMMIT_MSG_FILE) ]; then \
		$(BUN) run commitlint -e $(COMMIT_MSG_FILE); \
	else \
		echo "$(COMMIT_MSG_FILE) is empty, aborting."; \
		exit 1; \
	fi

runMessage: dev
	@if curl -sf http://ollama:11434; then \
		$(MAKE) message; \
	else \
		$(BUN) run cz --hook; \
	fi

runPreCommit: dev createBuild	
	$(BUN) run lint
