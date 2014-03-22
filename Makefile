MOCHA = node_modules/.bin/mocha
UGLIFYJS = node_modules/.bin/uglifyjs
RELEASE = simple-lru.min.js
TEST_PREFIXES = $(wildcard test/fixtures/prefix*)
TESTS = $(patsubst test/fixtures/prefix-%.js, \
                   test/simple-lru-%.js, \
                   $(TEST_PREFIXES))

build: $(RELEASE) $(TESTS)

# run mocha tests
#   simple-lru-node       test vanilla simple-lru.
#   simple-lru-node-min   test minified simple-lru.
#   simple-lru-node-old   test simple-lru with old environment that doesn't have
#                         `Object.create` method.
test: build
	$(MOCHA) --expose-gc \
           test/simple-lru-node.js \
           test/simple-lru-node-min.js \
           test/simple-lru-node-old.js \
           test/leak.js

# concatenate mocha test and prefix scripts that does requiring
$(TESTS): test/simple-lru-%: test/fixtures/prefix-%
	@cat $< test/fixtures/base.js > $@

# minification
$(RELEASE): simple-lru.js
	$(UGLIFYJS) --mangle --reserved 'module' $< -o $@
	@echo 'minify done $@'

clean:
	rm -f $(RELEASE) $(TESTS)

.PHONY: test clean build
