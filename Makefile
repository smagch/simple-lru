
MOCHA = node_modules/.bin/mocha

test:
	$(MOCHA) --expose-gc
	SIMPLE_LRU_USE_OLD=true $(MOCHA) --expose-gc

.PHONY: test
