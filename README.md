# Simple [LRU] cache in JavaScript

[![browser support](https://ci.testling.com/smagch/simple-lru.png)](https://ci.testling.com/smagch/simple-lru)

The implementation is inspired by [node-lru-cache] by Isaac Schlueter. The
motivation of this project is to provide `Object.create` fallback in order to
work on IE8.

## Installation

  With [npm](https://npmjs.org/)

```shell
$ npm install simple-lru
```

  With [Component](https://github.com/component/component)

```shell
$ component install smagch/simple-lru
```

  With [Bower](http://bower.io/)

```shell
$ bower install simple-lru
```

  Or download [tarball](https://github.com/smagch/simple-lru/archive/master.zip).

## Examples

  You can set any value with a string key.

```js
var cache = new SimpleLRU(3);
cache.set('a', 'A');
cache.set('b', {name: 'smagch'});
cache.set('c', 1000);
var a = cache.get('a'); // a = 'A'
var b = cache.get('b'); // b = {name: 'smagch'}
var c = cache.get('c'); // c = 1000
```

  It removes cache items automatically when total length get out of max.

```js
var cache = new SimpleLRU(3);
cache.set('a', 'A');
cache.set('b', 'B');
cache.set('c', 'C');
cache.set('d', 'D');
var a = cache.get('a'); // a = undefined;
var b = cache.get('b'); // b = 'B'
var c = cache.get('c'); // c = 'C'
var d = cache.get('d'); // d = 'D'
var keys = cache.keys(); // keys = ['b', 'c', 'd']
```

  Since it's using [LRU] cache algorithm, it removes the least recently used
  item.

```js
var cache = new SimpleLRU(3);
cache.set('a', 'A');
cache.set('b', 'B');
cache.set('c', 'C');
// Calling `get` with 'a', 'a' is the most recently used item.
var a = cache.get('a'); // a = 'A'
var keys = cache.keys(); // keys = ['b', 'c', 'a']

cache.set('d', 'D');
a = cache.get('a'); // a = 'A'
var b = cache.get('b'); // b = undefined
var c = cache.get('c'); // c = 'C'
var d = cache.get('d'); // d = 'D'
```

## API

### new SimpleLRU(max)

  Create a new `SimpleLRU` instance with given max cache number. `max` option
  should be a positive number.

### SimpleLRU#set(key, value)

  Set a new cache with given key and value.

### SimpleLRU#get(key)

  Get a cache by key.

### SimpleLRU#peek(key)

  Get a cache without updating recently used order.

### SimpleLRU#del(key)

  Delete a cache by key.

### SimpleLRU#has(key)

  See if it has a cache with given key.

### SimpleLRU#length()

  Return total number of cache items.

### SimpleLRU#reset()

  Clear all stored cache.

### SimpleLRU#keys()

  Return an Array of existing cache keys in least recently used order. The most
  recently used cache item will be the last.

### SimpleLRU#max([max])

  Getter|Setter of `max` option. Get a `max` option if it has no argument. And
  change `max` option with an argument. It will trim cache when new `max` option
  is smaller than its length.

## License

  MIT

[node-lru-cache]: https://github.com/isaacs/node-lru-cache
[LRU]: http://en.wikipedia.org/wiki/Cache_algorithms#Least_Recently_Used
[index.js]: https://raw.github.com/smagch/simple-lru/master/index.js
[Release page]: https://github.com/smagch/simple-lru/releases
