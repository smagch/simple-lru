
var expect = require('expect.js')
var SimpleLRU

if (process.env.SIMPLE_LRU_USE_OLD) {
  var nativeCreate = Object.create
  Object.create = undefined
  SimpleLRU = require('../')
  Object.create = nativeCreate
} else {
  SimpleLRU = require('../')
}

describe('SimpleLRU', function () {

  describe('#set', function () {
    it('should store any type value', function () {
      var cache = new SimpleLRU(5);
      cache.set('a', 'SimpleLRU');
      cache.set('b', true);
      cache.set('c', 1001);
      cache.set('d', {name: 'SimpleLRU'})
      cache.set('e', ['a', 1, 'b', 2, 'c'])
      expect(cache.get('a')).to.be('SimpleLRU')
      expect(cache.get('b')).to.be(true)
      expect(cache.get('c')).to.be(1001)
      expect(cache.get('d')).to.eql({name: 'SimpleLRU'})
      expect(cache.get('e')).to.eql(['a', 1, 'b', 2, 'c'])
      expect(cache.get('f')).to.be(undefined)
    })

    it('should delete cache when its length is out of max', function () {
      var cache = new SimpleLRU(3)
      cache.set('a', 'hoge')
      cache.set('b', 'foo')
      cache.set('c', 'bar')
      cache.set('d', 'foobar2000')
      expect(cache.get('a')).to.be(undefined)
      expect(cache.get('b')).to.be('foo')
      expect(cache.get('c')).to.be('bar')
      expect(cache.get('d')).to.be('foobar2000')
      expect(cache.length()).to.be(3)
    })

    it('should be overwrite value with an existing key', function () {
      var cache = new SimpleLRU(2)
      cache.set('a', 'foo')
      cache.set('b', 'B')
      cache.set('a', 'foobar2000')
      cache.set('c', 'C')
      expect(cache.get('a')).to.be('foobar2000')
      expect(cache.length()).to.be(2)
      expect(cache.get('b')).to.be(undefined)
    })
  })

  describe('#get', function () {
    it('should update recently used order', function () {
      var cache = new SimpleLRU(2)
      cache.set('a', 'A')
      cache.set('b', 'B')
      expect(cache.get('b')).to.be('B')
      expect(cache.get('a')).to.be('A')
      cache.set('c', 'C')
      expect(cache.get('c')).to.be('C')
      expect(cache.get('b')).to.be(undefined)
      expect(cache.get('a')).to.be('A')
    })
  })

  describe('#peek', function () {
    it('should not update recently used order', function () {
      var cache = new SimpleLRU(2)
      cache.set('a', 'A')
      cache.set('b', 'B')
      expect(cache.peek('b')).to.be('B')
      expect(cache.peek('a')).to.be('A')
      cache.set('c', 'C')
      expect(cache.peek('c')).to.be('C')
      expect(cache.peek('b')).to.be('B')
      expect(cache.peek('a')).to.be(undefined)
    })
  })

  describe('#has', function () {
    it('should return boolean', function () {
      var cache = new SimpleLRU(2)
      cache.set('a', 'A')
      cache.set('b', 'B')
      expect(cache.has('a')).to.be(true)
      expect(cache.has('b')).to.be(true)
      expect(cache.has('c')).to.be(false)
    })

    it('should not update recently used order', function () {
      var cache = new SimpleLRU(2)
      cache.set('a', 'A')
      cache.set('b', 'B')
      cache.has('a')
      cache.set('c', 'C')
      expect(cache.get('a')).to.be(undefined)
      expect(cache.get('b')).to.be('B')
      expect(cache.get('c')).to.be('C')
    })
  })

  describe('#del', function () {
    it('should delete a cache returning value', function () {
      var cache = new SimpleLRU(3)
      cache.set('a', 'A')
      cache.set('b', 'B')
      cache.set('c', 'C')
      var A = cache.del('a')
      var C = cache.del('c')
      expect(A).to.be('A')
      expect(C).to.be('C')
      expect(cache.length()).to.be(1)
    })
  })

  describe('#keys', function () {
    it('should return keys in least recently used order', function () {
      var cache = new SimpleLRU(4)
      cache.set('b', 'b')
      cache.set('a', 'a')
      expect(cache.keys()).to.eql(['b', 'a'])
      cache.set('b', 'B')
      expect(cache.keys()).to.eql(['a', 'b'])
      cache.set('c', 'C')
      cache.set('e', 'E')
      cache.set('d', 'D')
      cache.get('e')
      expect(cache.keys()).to.eql(['b', 'c', 'd', 'e'])
      expect(cache.length()).to.be(4)
      expect(cache.max()).to.be(4)
    })
  })

  describe('#each', function () {
    it('should loop through in least recently used order', function () {
      var cache = new SimpleLRU(3)
      cache.set('b', 'B')
      cache.set('a', 'A')
      cache.get('b')
      cache.set('c', 'C')
      var keys = ['a', 'b', 'c']
      var values = ['A', 'B', 'C']
      var i = 0
      cache.each(function (val, key) {
        expect(val).to.be(values[i])
        expect(key).to.be(keys[i])
        i++
      })
    })
  })

  describe('#length', function () {
    it('should return total number of cache', function () {
      var cache = new SimpleLRU(3)
      expect(cache.length()).to.be(0)
      cache.set('a', 'A')
      expect(cache.length()).to.be(1)
      cache.set('b', 'B')
      expect(cache.length()).to.be(2)
      cache.set('a', 'A2')
      expect(cache.length()).to.be(2)
      cache.set('c', 'C')
      expect(cache.length()).to.be(3)
      cache.set('d', 'D')
      expect(cache.length()).to.be(3)
      cache.del('a')
      expect(cache.length()).to.be(2)
      cache.del('c')
      expect(cache.length()).to.be(1)
      cache.del('d')
      expect(cache.length()).to.be(0)
    })
  })

  describe('#reset', function () {
    var cache = new SimpleLRU(3)
    cache.set('a', 'A')
    cache.set('b', 'B')
    cache.set('c', 'C')
    expect(cache.get('a')).to.be('A')
    expect(cache.get('b')).to.be('B')
    expect(cache.get('c')).to.be('C')
    expect(cache.length()).to.be(3)
    expect(cache.max()).to.be(3)
    expect(cache.keys()).to.eql(['a', 'b', 'c'])
    cache.reset()
    expect(cache.get('a')).to.be(undefined)
    expect(cache.get('b')).to.be(undefined)
    expect(cache.get('c')).to.be(undefined)
    expect(cache.length()).to.be(0)
    expect(cache.max()).to.be(3)
    expect(cache.keys()).to.eql([])
  })

  describe('#max', function () {
    it('should get max cache option', function () {
      expect(new SimpleLRU(10).max()).to.be(10)
      expect(new SimpleLRU(99).max()).to.be(99)
      expect(new SimpleLRU(1020).max()).to.be(1020)
    })

    it('should expand max cache option', function () {
      var cache = new SimpleLRU(1)
      expect(cache.max()).to.be(1)
      cache.set('a', 'A')
      cache.set('b', 'B')
      expect(cache.get('a')).to.be(undefined)
      expect(cache.get('b')).to.be('B')
      cache.max(3)
      cache.set('a', 'A')
      cache.set('c', 'C')
      expect(cache.get('a')).to.be('A')
      expect(cache.get('b')).to.be('B')
      expect(cache.get('c')).to.be('C')
      cache.set('d', 'D')
      expect(cache.get('d')).to.be('D')
      expect(cache.get('a')).to.be(undefined)
    })

    it('should shrink max cache option', function () {
      var cache = new SimpleLRU(5)
      cache.set('a', 'A')
      cache.set('b', 'B')
      cache.set('c', 'C')
      cache.set('d', 'D')
      cache.set('e', 'E')
      expect(cache.length()).to.be(5)
      cache.max(3)
      expect(cache.length()).to.be(3)
      expect(cache.max()).to.be(3)
      expect(cache.get('a')).to.be(undefined)
      expect(cache.get('b')).to.be(undefined)
      expect(cache.get('c')).to.be('C')
      expect(cache.get('d')).to.be('D')
      expect(cache.get('e')).to.be('E')
     })
  })

})