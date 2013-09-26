
MOCHA = node_modules/.bin/mocha
UGLIFYJS = node_modules/.bin/uglifyjs
RELEASE = simple-lru.min.js

testall: minify
	$(MOCHA) --expose-gc
	SIMPLE_LRU_USE_OLD=true $(MOCHA) --expose-gc
	SIMPLE_LRU_TARGET=$(RELEASE) $(MOCHA) --expose-gc
	SIMPLE_LRU_TARGET=$(RELEASE) SIMPLE_LRU_USE_OLD=true $(MOCHA) --expose-gc

test:
	$(MOCHA) --expose-gc

minify: $(RELEASE)

$(RELEASE): index.js
	$(UGLIFYJS) --mangle --reserved 'module' $< -o $@
	@echo 'minify done $@'

clean:
	rm -f $(RELEASE)

.PHONY: test minify clean
