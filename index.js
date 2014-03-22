;(function () {
  'use strict';

  /**
   * export SimpleLRU for CommonJS, AMD
   */
  if (typeof define === "function" && define.amd) {
    define(function () {
      return SimpleLRU;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleLRU;
  } else if (typeof window !== 'undefined') {
    window.SimpleLRU = SimpleLRU;
  }

  SimpleLRU.version = '0.0.3';

  /**
   * Simple mixin utility
   * @api private
   */
  function extend(obj1, obj2) {
    for (var key in obj2) obj1[key] = obj2[key];
  }

  var nativeCreate = Object.create;

  /**
   * Object data store
   * this is a `Object.create` fallback in order to support IE8
   * @api private
   */
  var Data = (function () {
    var Data, proto;

    if (typeof nativeCreate === 'function') {
      Data = function () {
        this.data = nativeCreate(null);
      };

      proto = {
        get: function (key) {
          return this.data[key];
        },
        has: function (key) {
          return !! this.data[key];
        }
      };

    } else {
      Data = function () {
        this.data = {};
      };

      proto = {
        get: function (key) {
          if (this.has(key)) return this.data[key];
        },
        has: function (key) {
          return Object.prototype.hasOwnProperty.call(this.data, key);
        }
      };
    }

    extend(proto, {
      set: function (key, val) {
        this.data[key] = val;
      },
      del: function (key) {
        var val = this.get(key);
        if (typeof val !== 'undefined') {
          delete this.data[key];
          return val;
        }
      }
    });

    extend(Data.prototype, proto);

    return Data;
  })();

  /**
   * Cache entry instance
   *
   * @param {String}
   * @param {any}
   * @param {Number}
   * @api private
   */
  function Entry(key, val, index) {
    this.key = key;
    this.val = val;
    this.index = index;
  }

  /**
   * SimpleLRU constructor
   * It holds following private properties. See `#reset()`
   *
   *   _byKey    {Data}    map by key
   *   _byOrder  {Object}  map by recently used order
   *   _head     {Number}  index of next entry
   *   _tail     {Number}  index of least recently used cache item
   *   _len      {Number}  total number of cache items
   *
   * `_tail` is an index of the least recently used cache item.
   * `_head` is an index of the most recently used cache item *plus* one.
   *
   * @param {Number} max length of cache item
   */
  function SimpleLRU(max) {
    if (typeof max !== 'number') throw new TypeError('max is requried');
    this.max(max);
    this.reset();
  }

  extend(SimpleLRU.prototype, {

    /**
     * Set cache by key
     * @param {String} unique string key
     * @param {String|Object|Number} any value
     */
    set: function (key, val) {
      var entry = this._byKey.get(key);

      // reuse entry if the key exists
      if (entry) {
        this._touch(entry);
        entry.val = val;
        return;
      }

      entry = new Entry(key, val, this._head++);
      this._byKey.set(key, entry);
      this._byOrder[entry.index] = entry;
      this._len++;
      this._trim();
    },

    /**
     * delete cache by key
     *
     * @param {String}
     * @return {String|Object|Number} cached value
     */
    del: function (key) {
      var entry = this._byKey.del(key);
      if (!entry) return;

      delete this._byOrder[entry.index];
      this._len--;

      if (this._len === 0) {
        this._head = this._tail = 0;
      } else {
        // update most index if it was most lecently used entry
        if (entry.index === this._head - 1) this._pop();
        // update least index if it was least lecently used entry
        if (entry.index === this._tail) this._shift();
      }

      return entry.val;
    },

    /**
     * get cache by key
     *
     * @param {String}
     * @return {any} cache if it exists
     */
    get: function (key) {
      var entry = this._byKey.get(key);
      if (entry) {
        this._touch(entry);
        return entry.val;
      }
    },

    /**
     * get a cache by key without touching index
     * @return {any}
     */
    peek: function (key) {
      var entry = this._byKey.get(key);
      if (entry) return entry.val;
    },

    /**
     * see if key is exists or not
     * @return {Boolean}
     */
    has: function (key) {
      return this._byKey.has(key);
    },

    /**
     * total number of cache
     * @return {Number}
     */
    length: function () {
      return this._len;
    },

    /**
     * clear all stored cache
     */
    reset: function () {
      this._byKey = new Data();
      this._byOrder = nativeCreate ? nativeCreate(null) : {};
      this._head = 0;
      this._tail = 0;
      this._len = 0;
    },

    /**
     * Getter|Setter function of "max" option
     * @param {Number} if setter
     */
    max: function (max) {
      if (typeof max !== 'number') return this._max;
      if (max < 1) throw new TypeError('max should be a positive number');
      var shrink = (this._max || 0) > max;
      this._max = max;
      if (shrink) this._trim();
    },

    /**
     * return array of keys in least recently used order
     * @return {Array}
     */
    keys: function () {
      var count = 0
        , tail = this._tail
        , head = this._head
        , keys = new Array(this._len);

      for (var i = tail; i < head; i++) {
        var entry = this._byOrder[i];
        if (entry) keys[count++] = entry.key;
      }

      return keys;
    },

    /**
     * update least recently used index of an entry to "_head"
     *
     * @param {Entry}
     * @api private
     */
    _touch: function (entry) {
      // update most number to key
      if (entry.index !== this._head - 1) {
        var isTail = entry.index === this._tail;
        delete this._byOrder[entry.index];
        entry.index = this._head++;
        this._byOrder[entry.index] = entry;
        if (isTail) this._shift();
      }
    },

    /**
     * trim entries
     * @api private
     */
    _trim: function () {
      var max = this._max;
      while (max < this._len) {
        var tailEntry = this._byOrder[this._tail];
        this.del(tailEntry.key);
      }
    },

    /**
     * update tail index
     * @return {Entry|undefined}
     * @api private
     */
    _shift: function () {
      var tail = this._tail
        , head = this._head;
      for (var i = tail; i < head; i++) {
        var entry = this._byOrder[i];
        if (entry) {
          this._tail = i;
          return entry;
        }
      }
    },

    /**
     * update head index
     * @return {Entry|undefined}
     * @api private
     */
    _pop: function () {
      var tail = this._tail
        , head = this._head;
      for (var i = head - 1; i >= tail; i--) {
        var headEntry = this._byOrder[i];
        if (headEntry) {
          this._head = i + 1;
          return headEntry;
        }
      }
    }
  });

})();