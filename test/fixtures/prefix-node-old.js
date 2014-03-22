var expect = require('expect.js');
var nativeCreate = Object.create;
Object.create = undefined;
var SimpleLRU = require('../simple-lru');
Object.create = nativeCreate;
