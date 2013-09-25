;(function () {
  'use strict';

  /**
   * export SimpleLRU for CommonJS
   */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleLRU;
  } else if (typeof window !== 'undefined') {
    window.SimpleLRU = SimpleLRU;
  }

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
   * cache entry
   */
  function Entry(key, val, index) {
    this.key = key;
    this.val = val;
    this.index = index;
  }

  /**
   * SimpleLRU constructor
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
      // reuse entry
      if (entry) {
        this._touch(entry);
        entry.val = val;
        return;
      }

      entry = new Entry(key, val, ++this._head);
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

      // update most index if it was most lecently used entry
      if (entry.index === this._head) this._headEntry();

      // update least index if it was least lecently used entry
      if (entry.index === this._tail) this._tailEntry();

      delete this._byOrder[entry.index];
      this._len--;

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
     * reset all cache
     */
    reset: function () {
      this._byKey = new Data();
      this._byOrder = nativeCreate ? nativeCreate(null) : {};
      this._head = 0;
      this._tail = 0;
      this._len = 0;
    },

    /**
     * getter|setter of "max"
     */
    max: function (max) {
      if (typeof max !== 'number') return this._max;
      if (max < 1) throw new TypeError('max should be a positive number');
      var shrink = this._max > max;
      this._max = max;
      if (shrink) this._trim();
    },

    /**
     * return array of keys
     * @return {Array}
     */
    keys: function () {
      var i = 0
        , keys = new Array(this._len);

      this.each(function (val, key) {
        keys[i++] = key;
      });

      return keys;
    },

    /**
     * call function in least recently used order
     * the most recently used cache will be executed last
     * @param {Function}
     */
    each: function (fn, context) {
      for (var i = this._tail; i <= this._head; i++) {
        var entry = this._byOrder[i];
        if (entry) fn.call(context, entry.val, entry.key);
      }
    },

    /**
     * touch entry
     * @param {Entry}
     * @api private
     */
    _touch: function (entry) {
      // update most number to key
      if (entry.index !== this._head) {
        delete this._byOrder[entry.index];
        entry.index = ++this._head;
        this._byOrder[entry.index] = entry;
      }
    },

    /**
     * trim entries
     * @api private
     */
    _trim: function () {
      while (this._max < this._len) {
        var entry = this._tailEntry();
        if (!entry) return;
        this.del(entry.key);
      }
    },

    /**
     * return the least recently used entry
     * @api private
     * @return {Entry|undefined}
     */
    _tailEntry: function () {
      for (var i = this._tail; i <= this._head; i++) {
        var entry = this._byOrder[i];
        if (entry) {
          this._tail = i;
          return entry;
        }
      }
    },

    /**
     * return the most recently used entry
     * @api private
     * @return {Entry|undefined}
     */
    _headEntry: function () {
      for (var i = this._head; i >= this._tail; i--) {
        var entry = this._byOrder[i];
        if (entry) {
          this._head = i;
          return entry;
        }
      }
    }
  });

})();