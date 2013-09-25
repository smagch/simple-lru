# Simple LRU cache in JavaScript

The implementation is shamelessly heavily inspired by [node-lru-cache] by Isaac
Schlueter. The motivation of this project is to provide `Object.create` fallback
which IE8 doesn't support.

## API

### new SimpleLRU(max)

  Create a new `SimpleLRU` instance with given max cache number. `max` option
  should be a positive number.

### SimpleLRU#set(key, value)

  Set a new cache with given key and value.

### SimpleLRU#get(key)

  Get a cache by key.

### SimpleLRU#peek(key, value)

  Get a cache without updating recently used order.

### SimpleLRU#del(key)

  Delete a cache by key.

### SimpleLRU#has(key)

  See if it has a cache with given key.

### SimpleLRU#length()

  Return total number of cache items.

### SimpleLRU#reset()

  Clear all cache.

### SimpleLRU#each(function (value, key) {}, context)

  Iterate all cache entry in least recently used order. The most recently used
  item will be called lastly.

### SimpleLRU#keys()

  Return an Array of existing cache keys in least recently used order.

### SimpleLRU#max([max])

  Getter/Setter of `max` option. Get a `max` option if it has no argument. And
  change `max` option with an argument. It will trim cache when new `max` option
  is smaller than its length.

[node-lru-cache]: https://github.com/isaacs/node-lru-cache
