
MOCHA = node_modules/.bin/mocha

test:
	$(MOCHA)
	SIMPLE_LRU_USE_OLD=true $(MOCHA)

.PHONY: test
