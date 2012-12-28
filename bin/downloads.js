#!/usr/bin/env node

var program = new (require('commander')).Command('npm-downloads')
var downloads = require('../');
var Table = require('cli-table');
var ProgressBar = require('progress');

process.title = 'npm-downloads';

program.version(require('../package').version)
  .description('Prints the number of downloads for <package> and it\'s dependents')
  .usage('[options] <package>')
  .option('-s, --start [date]', 'Start date (defaults to a month ago)')
  .option('-e, --end [date]', 'End date (defaults to yesterday)')
  .option('-f, --format [format]', 'Output format (json, tab, pretty)')
  .option('-S, --subtract', 'Subtract dependents downloads from <package> total')
  .option('-p, --no-progress', 'Disable the progress bar')
  .option('-q, --quick', 'Prints only the total number of <package> downloads')
  .parse(process.argv);

/**
 * Ensure a package has been specified.
 */

if (!program.args.length) {
  process.stdout.write(program.helpInformation());
  process.exit(1)
  return;
}

/**
 * Date helpers
 */

var month = new Date(Date.now() - 1000 * 60 * 60 * 24 * 31)
var end = new Date(Date.now() - 1000 * 60 * 60 * 24)

/**
 * args
 */

var pkg = program.args[0];
var start = program.start || month;
var end = program.end || end;
var format = program.format || 'tab';
var quick = !! program.quick;
var showProgress = !! program.progress;
var subtract = !! program.subtract;

/**
 * validate format
 */

var allowedFormats = 'json tab pretty'.split(' ');
if (!~allowedFormats.indexOf(format)) {
  console.error(' [ Error! Bad format: `' + format + '` ]\n');
  process.stdout.write(program.helpInformation());
  process.exit(1);
}

/**
 * execute
 */

var options = {
    start: start
  , end: end
  , quick: quick
  , subtract: subtract
}

var progressor = downloads(pkg, options, function (err, output) {
  if (err) {
    console.error(err.stack || err);
    process.exit(1);
  }

  process.stdout.write(stylize(output));
});

/**
 * progress bar
 */

if (showProgress) {
  progressor.once('progress', function (total, complete) {
    var progress = new ProgressBar(':bar :percent', { total: total, width: 60 });
    progress.tick();
    progressor.on('progress', function (total, complete) {
      progress.total = total;
      var amount = complete >= total
        ? 1000000000
        : 1;
      progress.tick(amount);
      if (progress.complete) {
        console.log();
      }
    })
  })
}

/**
 * Stylize the `output` acording to specified `format`.
 */

function stylize (output) {
  if (!Array.isArray(output)) {
    output = [{ name: pkg, count: output }];
  }
  return formats[format](output);
}

var formats = {};

formats.json = function (data) {
  return JSON.stringify(data);
}

formats.tab = function (data) {
  var str = '';
  data.forEach(function (package) {
    str += package.name + '\t' + package.count + '\n';
  });
  return str;
}

formats.pretty = function (data) {
  var table = new Table({ head: ['Package', 'Downloads'] });
  data.forEach(function (package) {
    table.push([package.name, package.count]);
  });
  return table.toString() + '\n';
}

