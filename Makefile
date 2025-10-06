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
	rm -rf $(ROOT_MAKEFILE)/$(PHP_VENDOR_BE)
	rm -rf $(ROOT_MAKEFILE)/$(CACHE_DIR)
	rm -rf $(ROOT_MAKEFILE)/$(EXTRA_STYLE)

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

runPreCommit: dev createBuild	
	$(BUN) run lint

runUpdate: %: export_% dev

export_runUpdate: clean postInstall
	echo "UPDATE NODE -> $(NODE_ENV)"
	$(BUN) update
	rm -f $(ROOT_MAKEFILE)/*.lock
	$(BUN) install --lockfile-only --exact --no-cache
	echo "UPDATE COMPOSER"
	$(COMPOSER_BE) update -d $(ROOT_MAKEFILE)/$(STRINF_BACKEND_SRC) 

runCron: dev
	bash $(ROOT_MAKEFILE)/$(BIN_BACKEND_RUN_CRON)

runTests: STAGE = true
runTests: build createBuild		
	$(BUN) run test || $(shell echo "FAILED" && exit 1)