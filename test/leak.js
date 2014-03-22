
var expect = require('expect.js')
  , weak = require('weak')
  , SimpleLRU = require('../simple-lru')

describe('momeory leak', function () {
  var ref = 0
  function Value(index) {
    this.index = index
    ref++
    weak(this, function () { ref--; })
  }

  it('should not happen', function () {
    var cache = new SimpleLRU(100)
    expect(ref).to.be(0)
    for (var i = 0; i < 100; i++) {
      cache.set('key:' + i, new Value(i))
    }
    expect(ref).to.be(100)
    gc()
    expect(ref).to.be(100)

    for (var i = 0; i < 10000; i++) {
      cache.set('key:' + i, new Value(i))
    }
    gc()
    expect(ref).to.be(100)
  })
})