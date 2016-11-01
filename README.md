# eslint-plugin-sort-requires

[![Build Status](https://travis-ci.org/kentor/eslint-plugin-sort-requires.svg?branch=master)](https://travis-ci.org/kentor/eslint-plugin-sort-requires) [![npm](https://img.shields.io/npm/v/eslint-plugin-sort-requires.svg)](https://www.npmjs.com/package/eslint-plugin-sort-requires)

ESLint rule to enforce sorting of variable declarations in a group of `require()` calls

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm install eslint --save-dev
```

Next, install `eslint-plugin-sort-requires`:

```
$ npm install eslint-plugin-sort-requires --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must
also install `eslint-plugin-sort-requires` globally.

## Usage

Add `sort-requires` to the plugins section of your `.eslintrc` configuration
file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": [
    "sort-requires"
  ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "sort-requires/sort-requires": 2
  }
}
```

## sort-requires

Enforce alphabetically sorting of variable declarations in a group of
`require()` calls. A group is a section of code where there are no blank lines
between the end of one variable declaration node with a `require()` call the
beginning of the next.

#### Good
```js
var a = require('a');
var c = require('b');

var b = require('b');

// const comes before let
const e = require('e');
let d = require('d');
```

#### Bad
```js
var b = require('b');
var a = require('a');

var d =
  require('d');
var c = require('c');

// const comes before let
let e = require('e');
const f = require('f');
```

See [tests/lib/rules/sort-requires.js](tests/lib/rules/sort-requires.js) for
more cases.

## Changelog

### 2.1.0
* change report message and location to entire require group
* improve eslint auto fixing by requiring only a single pass

### 2.0.0
* add eslint auto fixing
* remove jscodeshift fixer

### 1.0.0
* initial build

## License

[MIT](LICENSE.txt)
