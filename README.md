#npm-downloads
===============

Prints the number of downloads for a given npm package and the packages that directly depend on it.

```
Usage: npm-downloads [options] <package>

Options:

  -h, --help             output usage information
  -V, --version          output the version number
  -s, --start [date]     Start date (defaults to a month ago)
  -e, --end [date]       End date (defaults to yesterday)
  -f, --format [format]  Output format (json, tab, pretty)
  -S, --subtract         Subtract dependents downloads from <package> total
  -p, --no-progress      Disable the progress bar
  -q, --quick            Prints only the total number of <package> downloads
```

### Formats

There are three output formats available: `tab`, `json`, and `pretty` (tab is the default).

#### tab

```
$ npm-downloads ms
=========================================================== 100%
ms  68009
mocha 72979
mongoose  42450
zombie  5509
jog 1731
up  1009
satisfy 109
hoarders  60
workforce 45
cloud-switch  30
component-search  29
situation 24
racker  20
animation 15
mongoose-ttl  14
npm-research  10
authors 5
fnoc  5
simple-queue-service  4
cache22 3
jotan 3
jog2  1
```

#### json

```
$ npm-downloads -f json -p ms
[{"name":"ms","count":68009},{"name":"mocha","count":72979},{"name":"mongoose","count":42450},{"name":"zombie","count":5509},{"name":"jog","count":1731},{"name":"up","count":1009},{"name":"satisfy","count":109},{"name":"hoarders","count":60},{"name":"workforce","count":45},{"name":"cloud-switch","count":30},{"name":"component-search","count":29},{"name":"situation","count":24},{"name":"racker","count":20},{"name":"animation","count":15},{"name":"mongoose-ttl","count":14},{"name":"npm-research","count":10},{"name":"authors","count":5},{"name":"fnoc","count":5},{"name":"simple-queue-service","count":4},{"name":"jotan","count":3},{"name":"cache22","count":3},{"name":"jog2","count":1}]
```

#### pretty

```
$ npm-downloads -f pretty ms
=========================================================== 100%
┌──────────────────────┬───────────┐
│ Package              │ Downloads │
├──────────────────────┼───────────┤
│ ms                   │ 68009     │
├──────────────────────┼───────────┤
│ mocha                │ 72979     │
├──────────────────────┼───────────┤
│ mongoose             │ 42450     │
├──────────────────────┼───────────┤
│ zombie               │ 5509      │
├──────────────────────┼───────────┤
│ jog                  │ 1731      │
├──────────────────────┼───────────┤
│ up                   │ 1009      │
├──────────────────────┼───────────┤
│ satisfy              │ 109       │
├──────────────────────┼───────────┤
│ hoarders             │ 60        │
├──────────────────────┼───────────┤
│ workforce            │ 45        │
├──────────────────────┼───────────┤
│ cloud-switch         │ 30        │
├──────────────────────┼───────────┤
│ component-search     │ 29        │
├──────────────────────┼───────────┤
│ situation            │ 24        │
├──────────────────────┼───────────┤
│ racker               │ 20        │
├──────────────────────┼───────────┤
│ animation            │ 15        │
├──────────────────────┼───────────┤
│ mongoose-ttl         │ 14        │
├──────────────────────┼───────────┤
│ npm-research         │ 10        │
├──────────────────────┼───────────┤
│ authors              │ 5         │
├──────────────────────┼───────────┤
│ fnoc                 │ 5         │
├──────────────────────┼───────────┤
│ simple-queue-service │ 4         │
├──────────────────────┼───────────┤
│ cache22              │ 3         │
├──────────────────────┼───────────┤
│ jotan                │ 3         │
├──────────────────────┼───────────┤
│ jog2                 │ 1         │
└──────────────────────┴───────────┘
```

### Dependents

We might be curious about how many programs are using `<package>` as a direct dependency. It turns out that this isn't really possible. We can however get a _very rough_ (mostly worthless) idea by enabling the `-S` flag which will subtract dependents downloads from `<package>` downloads. Note that this is just an estimate as are [all download counts](https://groups.google.com/d/topic/npm-/4geHD9BdcBM/discussion).

```
$ npm-downloads -s 12-25-2012 -S -p ms
ms  0
mocha 4703
mongoose  2632
zombie  262
up  91
jog 68
satisfy 7
hoarders  4
situation 3
workforce 2
simple-queue-service  1
component-search  0
fnoc  0
jog2  0
cloud-switch  0
authors 0
cache22 0
racker  0
jotan 0
npm-research  0
animation 0
mongoose-ttl  0
```

## Installation

```
$ npm install -g npm-downloads
```

## License

[MIT](https://github.com/aheckmann/npm-downloads/blob/master/LICENSE)
