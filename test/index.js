var assert = require('assert')
var q = require('../')

var pkg = 'sliced';

q(pkg, { start: '2012-12-24', end: '2012-12-25', quick: true }, function (err, arr) {
  assert.ifError(err);
  assert.equal(857, arr);
  q(pkg, { start: '2012-12-24', end: '2012-12-25' }, function (err, arr) {
    assert.ifError(err);
    assert.ok(Array.isArray(arr));
    assert.equal(pkg, arr[0].name);
    assert.equal(857, arr[0].count);
    q(pkg, { start: '2012-12-24', end: '2012-12-25', subtract: true }, function (err, arr) {
      assert.ifError(err);
      assert.ok(Array.isArray(arr));
      assert.equal(pkg, arr[0].name);
      assert.equal(0, arr[0].count);
      console.log('all tests passed');
    });
  });
});
