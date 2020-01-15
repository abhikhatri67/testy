# Testy
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)

[![ci](https://img.shields.io/travis/ngarbezza/testy.svg)](https://travis-ci.org/ngarbezza/testy)
![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@pmoo/testy.svg)
![dependencies](https://img.shields.io/david/ngarbezza/testy.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/6b6e4d071471379f31e7/maintainability)](https://codeclimate.com/github/ngarbezza/testy/maintainability)
![package-size](https://img.shields.io/bundlephobia/min/@pmoo/testy.svg)
![downloads](https://img.shields.io/npm/dt/@pmoo/testy.svg)
![activity](https://img.shields.io/github/commit-activity/w/ngarbezza/testy.svg)
![release-date](https://img.shields.io/github/release-date/ngarbezza/testy.svg)

A very simple JS testing library, for educational purposes. Live at npm at [@pmoo/testy](https://www.npmjs.com/package/@pmoo/testy).

## Installation

`npm install --save-dev @pmoo/testy`

**Supported Node versions**: 6.x or higher

## Usage

### Writing test suites

A test suite is a file that looks like this:

```javascript
const { suite, test, assert } = require('@pmoo/testy');

suite('a boring test suite', () => {
  test('42 is 42, not surprising', () => {
    assert.that(42).isEqualTo(42);
  });
});
```

A test suite represents a grouping of tests and it is implemented as a function call to `suite` passing a name and a zero-argument function, which is the suite body.

A test is implemented as a function call to `test()`, passing a name and the test body as a zero-argument function. 

Inside the test you can call different assertions that are documented in detail later on.

### Setting up the configuration

This is the recommended setup. Add a file `tests.js` (or whatever name you like) with the following content:

```javascript
const { Testy } = require('@pmoo/testy');

Testy.configuredWith({
  // relative or absolute path
  directory: './tests',
  // regular expression to filter test files to run
  filter: /.*test.js$/,
  // 'en' is the default. For example, you can try 'es' to see output in Spanish
  language: 'en',
  // Stops at the first failed or errored test. false by default
  failFast: false,
}).run();
```

And it will run every test suite under the `tests` directory (matching files ending with `*test.js`).

### Running Testy

Assuming you created `tests.js` with the Testy configuration, you can run it with:

```
$ node tests.js 
```

Or you can add it as the `test` script for npm in your `package.json`:

```
{
  ...
  "scripts": {
    "test": "node tests.js"
  },
  ...
}
```

And then run the tests using:
 
```
$ npm test
```

### Running a single file

**Note:** this could be good for prototyping or running small examples but it is not the recommended setup. It will be deprecated at some point.

```javascript
const { suite, test, assert } = require('@pmoo/testy');

suite('a boring test suite', () => {
  test('true is obviously true', () => assert.isTrue(true))
}).run();
```

(notice the `run()` at the end)

### Examples and available assertions

* Boolean assertions:
  * `assert.that(boolean).isTrue()` or `assert.isTrue(boolean)`. It does a strict comparison against `true` (`object === true`)
  * `assert.that(boolean).isFalse()` or `assert.isFalse(boolean)`. It does a strict comparison against `false` (`object === false`)
* Equality assertions:
  * `assert.that(actual).isEqualTo(expected)` or `assert.areEqual(actual, expected)`.
  * `assert.that(actual).isNotEqualTo(expected)` or `assert.areNotEqual(actual, expected)`
  * Equality assertions use a deep object comparison (based on Node's `assert` module) and fail if objects under comparison have circular references.
  * Equality criteria on non-primitive objects can be specified:
    * Passing an extra two-arg comparator function to `isEqualTo(expected, criteria)` or `areEqual(actual, expected, criteria)`
    * Passing a method name that `actual` object understands: `isEqualTo(expected, 'myEqMessage')` or `areEqual(actual, expected, 'myEqMessage')`
    * By default, if `actual` has an `equals` method it will be used.
    * If we compare `undefined` with `undefined` using `isEqualTo()`, it will make the test fail. For explicit check for `undefined`, use the `isUndefined()`/`isNotUndefined()` assertions documented above. 
* Check for `undefined` presence/absence:
  * `assert.that(aValue).isUndefined()` or `assert.isUndefined(aValue)`
  * `assert.that(aValue).isNotUndefined()` or `assert.isNotUndefined(aValue)`
* Exception testing:
  * `assert.that(() => { ... }).raises(error)` or with regex `.raises(/part of message/)`
  * `assert.that(() => { ... }).doesNotRaise(error)`
  * `assert.that(() => { ... }).doesNotRaiseAnyErrors()`
* Numeric assertions:
  * `assert.that(aNumber).isNearTo(anotherNumber)`. There's a second optional argument that indicates the number of digits to be used for precision. Default is `4`.
* Array inclusion:
  * `assert.that(collection).includes(object)`
  * `assert.that(collection).doesNotInclude(object)`
  * `assert.that(collection).includesExactly(...objects)`
* Emptiness
  * `assert.that(arrayOrString).isEmpty()`
  * `assert.that(arrayOrString).isNotEmpty()`

Please take a look at the `tests` folder, you'll find examples of each possible test you can write. Testy is self-tested.

### Other features

* **Running code before every test**: just like many testing frameworks have, there is a way to execute some code before every test in a suite using the `before()` function. Example:

    ```javascript
    const { suite, test, before, assert } = require('@pmoo/testy');
    
    suite('using the before() helper', () => {
      let answer;
    
      before(() => {
        answer = 42;
      });
    
      test('checking the answer', () => {
        assert.that(answer).isEqualTo(42);
      });
    });
    ```
* **Support for pending tests**: if a test has no body, it will be reported as `[WIP]` and it won't be considered a failure.
* **Fail-Fast mode**: if enabled, it stops execution in the first test that fails (or has an error). Remaining tests will be marked as skipped.
* **Strict check for assertions**: if a test does not evaluate any assertion while it is executed, the result is considered an error. Basically, a test with no assertion is considered a "bad" test.
* **Explicitly failing or marking a test as pending**: there's a possibility of marking a test as failed or pending, for example:

    ```javascript
    const { suite, test, fail, pending } = require('@pmoo/testy');
    
    suite('marking tests as failed and pending', () => {
      test('marking as failed', () =>
        fail.with('should not be here'));
      
      test('marking as pending', () =>
        pending.dueTo('did not have time to finish'));
    });
    ```
    
    The output includes the messages provided:
    ```
    [FAIL] marking as failed
      => should not be here
    [WIP] marking as pending
      => did not have time to finish
    ```

## Why?

Why another testing library? The main reason is that we want to keep simplicity, something it's hard to see in the main testing tools out there.

* **Zero dependencies:** right now, this library does not depend on any npm package, making the library easy to install, and fast: essential to have immediate feedback while doing TDD. This is also good for installing on places where the internet connection is not good and we don't want to download hundreds of libraries.
* **Understandable object-oriented code:** we want to use this tool for teaching, so eventually we'll look at the code during lessons, and students should be able to see what is going on, and even contributing at it, with no dark magic involved. Also, we try to follow good OO practices.
* **Unique set of features:** we are not following any specification nor trying to copy behavior from other approaches (like the "xUnit" or "xSpec" way).  

## Contributing

Please take a look at the [Contributing section](CONTRIBUTING.md).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/JavierGelatti"><img src="https://avatars2.githubusercontent.com/u/993337?v=4" width="100px;" alt="Facundo Javier Gelatti"/><br /><sub><b>Facundo Javier Gelatti</b></sub></a><br /><a href="https://github.com/ngarbezza/testy/commits?author=JavierGelatti" title="Tests">⚠️</a> <a href="https://github.com/ngarbezza/testy/commits?author=JavierGelatti" title="Code">💻</a></td>
    <td align="center"><a href="https://codepen.io/TomerBenRachel/"><img src="https://avatars2.githubusercontent.com/u/23402988?v=4" width="100px;" alt="Tomer Ben-Rachel"/><br /><sub><b>Tomer Ben-Rachel</b></sub></a><br /><a href="https://github.com/ngarbezza/testy/commits?author=TomerPacific" title="Tests">⚠️</a> <a href="https://github.com/ngarbezza/testy/commits?author=TomerPacific" title="Code">💻</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
