
/**
 * check if "SIMPLE_LRU_USE_OLD" env
 */
if (process.env.SIMPLE_LRU_USE_OLD) {
  console.log('old mode');
  var nativeCreate = Object.create;
  Object.create = undefined;
  module.exports = require('../../');
  Object.create = nativeCreate;
} else {
  module.exports = require('../../');
}
