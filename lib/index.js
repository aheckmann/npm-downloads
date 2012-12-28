// npm-downloads

/**
 * Dependencies
 */

var qs = require('querystring')
var EventEmitter = require('events').EventEmitter;
var request = require('superagent')

/**
 * perf boost
 * http://engineering.linkedin.com/nodejs/blazing-fast-nodejs-10-performance-tips-linkedin-mobile
 */

require('https').globalAgent.maxSockets = 30;

/**
 * Config
 */

var baseCountUrl = 'https://isaacs.iriscouch.com/downloads/_design/app/_view/pkg?'
var dependentsUrl = 'http://registry.npmjs.org/-/_view/dependedUpon?group_level=2'

/**
 * Expose
 */

module.exports = calc

/**
 * Look up pkg dependents, get downloads of each.
 *
 * Each dependent download implies a download of pkg
 * so we subtract dependent downloads from pkgs downloads
 * to get an accurant count of direct installs.
 */

function calc (pkg, options, cb) {
  if ('function' == typeof options) {
    cb = options;
    options = {}
  }

  var start = options.start;
  var end = options.end;
  var onlySelf = !! options.quick;
  var subtract = !! options.subtract;

  var ee = new EventEmitter;

  if (onlySelf) {
    downloads(pkg, start, end, cb);
    return ee;
  }

  // trigger progress
  setTimeout(function(){
    progress(ee, 100, 1);
  },1)

  dependents(pkg, function (err, packages) {
    if (err) return cb(err);

    packages.push(pkg);

    var total = packages.length + 1;

    allDownloads(packages, start, end, ee, total, function (err, data) {
      if (err) return cb(err);

      progress(ee, 100, 100);

      setTimeout(function(){
        compute(pkg, data, subtract, cb);
      },10)
    });
  });

  return ee;
}

/**
 * emits a progress event on `ee`
 */

function progress (ee, total, percent) {
  ee.emit('progress', total, percent);
}

/**
 * subtract values from pkg
 */

function compute (pkg, data, subtract, cb) {
  var dependents = 0;
  var package;

  data = data.filter(function (item) {
    if (pkg != item.name) {
      dependents += item.count;
      return true;
    } else {
      package = item;
      return false;
    }
  });

  if (subtract) {
    package.count -= dependents;
    // download tracking isn't accurate
    // https://groups.google.com/d/topic/npm-/4geHD9BdcBM/discussion
    if (package.count < 0) {
      package.count = 0;
    }
  }

  data.sort(function (a, b) {
    return a.count > b.count ? -1 :
           a.count < b.count ?  1 :
           0;
  });

  data.unshift(package);

  cb(null, data);
}

/**
 * Fetch download counts for each package
 */

function allDownloads (packages, start, end, ee, total, cb) {
  var pending = packages.length;
  var ret = [];

  function complete (err) {
    if (complete.err) return;
    if (err) return cb(complete.err = err);
    --pending;
    progress(ee, total, ratio(total, pending));
    if (0 === pending) {
      cb(err, ret);
    }
  }

  packages.forEach(function (pkg) {
    downloads(pkg, start, end, function (err, count) {
      if (err) return complete(err);
      ret.push({ name: pkg, count: count });
      complete();
    });
  })
}

/**
 * pending complete
 */

function ratio (total, pending, percent) {
  var r = total/(percent||0.88);
  return pending/r;
}

/**
 * Retreives the number of npm downloads of pkg
 * for the given date range.
 */

function downloads (pkg, start, end, cb) {
  request
    .get(countUrl(pkg, start, end))
    .type('json')
    .end(function (res) {
      if (res.ok) {
        try {
          var data = JSON.parse(res.text);
          data = (data.rows || []).reduce(function (set, row) {
            set[row.key[0]] = row.value;
            return set;
          }, {});
          cb(null, data[pkg] || 0);
        } catch (err) {
          cb(err)
        }
      } else {
        return cb(res.toError())
      }
    })
}

/**
 * Retreive all dependent packages of pkg
 */

function dependents (pkg, cb) {
  loadDependents(function (err, all) {
    if (err) return cb(err);
    cb(null, all[pkg] || []);
  });
}

function loadDependents (cb) {
  // TODO cache

  request
    .get(dependentsUrl)
    .type('json')
    .end(function (res) {
      if (res.ok) {
        try {
          var data = JSON.parse(res.text);
          data = (data.rows || []).reduce(function (set, row) {
            var keys = row.key;
            set[keys[0]] || (set[keys[0]] = []);
            set[keys[0]].push(keys[1]);
            return set;
          }, {});
          cb(null, data);
        } catch (err) {
          cb(err)
        }
      } else {
        return cb(res.toError())
      }
    })
}

/**
 * count url helpers
 */

function key (pkg, date) {
  if (!(date instanceof Date)) {
    if (Date.parse(date)) {
      date = new Date(date);
    } else {
      date = null;
    }
  }
  return JSON.stringify([pkg, date.toISOString().substr(0,10) ])
}

function q (pkg, start, end) {
  return qs.stringify({
      startkey: key(pkg, start)
    , endkey: key(pkg, end)
    , group_level: 1
  })
}

function countUrl (pkg, start, end) {
  return baseCountUrl + q(pkg, start, end);
}

