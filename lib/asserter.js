'use strict';

const Utils = require('./utils');
const EqualityAssertionStrategy = require('./equality_assertion_strategy');
const TestResult = require('./test_result');

class TestResultReporter {
  constructor(runner) {
    this._runner = runner;
  }
  
  report(result) {
    this._runner.setResultForCurrentTest(result);
  }
  
  translated(key) {
    return this._runner._i18n.translate(key);
  }
}

class FailureGenerator extends TestResultReporter {
  with(description) {
    this.report(TestResult.failure(description || this.translated('explicitly_failed')));
  }
}

class PendingMarker extends TestResultReporter {
  dueTo(reason) {
    this.report(TestResult.explicitlyMarkedAsPending(reason));
  }
}

class Asserter extends TestResultReporter {
  that(actual) {
    return new Assertion(this._runner, actual);
  }
  
  isTrue(actual) {
    return this.that(actual).isTrue();
  }
  
  isFalse(actual) {
    return this.that(actual).isFalse();
  }

  isUndefined(actual) {
    return this.that(actual).isUndefined();
  }

  isNotUndefined(actual) {
    return this.that(actual).isNotUndefined();
  }
  
  areEqual(actual, expected, criteria) {
    return this.that(actual).isEqualTo(expected, criteria);
  }
  
  areNotEqual(actual, expected) {
    return this.that(actual).isNotEqualTo(expected);
  }
  
  isEmpty(actual) {
    return this.that(actual).isEmpty();
  }
  
  isNotEmpty(actual) {
    return this.that(actual).isNotEmpty();
  }
}

class Assertion extends TestResultReporter {
  constructor(runner, actual) {
    super(runner);
    this._actual = actual;
  }
  
  // Boolean assertions
  
  isTrue() {
    this._booleanAssertion(true, this.translated('be_true'));
  }
  
  isFalse() {
    this._booleanAssertion(false, this.translated('be_false'));
  }

  // Undefined value assertions

  isUndefined() {
    this._undefinedAssertion(this.translated('be_undefined'));
  }

  isNotUndefined() {
    this._notUndefinedAssertion(this.translated('be_defined'));
  }
  
  // Equality assertions
  
  isEqualTo(expected, criteria) {
    this._equalityAssertion(expected, criteria, true);
  }
  
  isNotEqualTo(expected, criteria) {
    this._equalityAssertion(expected, criteria, false);
  }
  
  // Collection assertions
  
  includes(object) {
    const resultIsSuccessful = this._actual.includes(object);
    const failureMessage = `${this.translated('include')} ${object}`;
    this._reportAssertionResult(resultIsSuccessful, failureMessage);
  }
  
  doesNotInclude(object) {
    const resultIsSuccessful = !this._actual.includes(object);
    const failureMessage = `${this.translated('not_include')} ${object}`;
    this._reportAssertionResult(resultIsSuccessful, failureMessage);
  }
  
  includesExactly(...objects) {
    const resultIsSuccessful = Utils.haveSameElements(this._actual, objects);
    const failureMessage = `${this.translated('include_exactly')} ${Utils.prettyPrint(objects)}`;
    this._reportAssertionResult(resultIsSuccessful, failureMessage);
  }
  
  isEmpty() {
    const resultIsSuccessful = this._actual.length === 0;
    const failureMessage = this.translated('be_empty');
    this._reportAssertionResult(resultIsSuccessful, failureMessage);
  }
  
  isNotEmpty() {
    const resultIsSuccessful = this._actual.length > 0;
    const failureMessage = this.translated('be_not_empty');
    this._reportAssertionResult(resultIsSuccessful, failureMessage);
  }
  
  // Exception assertions
  
  raises(errorExpectation) {
    this._exceptionAssertion(errorExpectation, true);
  }
  
  doesNotRaise(notExpectedError) {
    this._exceptionAssertion(notExpectedError, false);
  }
  
  doesNotRaiseAnyErrors() {
    let noErrorsOccurred = false;
    let failureMessage = '';
    try {
      this._actual.call();
      noErrorsOccurred = true;
    } catch (error) {
      noErrorsOccurred = false;
      failureMessage = `${this.translated('expected_no_errors')}, ${this.translated('but')} ${Utils.prettyPrint(error)} ${this.translated('was_raised')}`;
    } finally {
      this._reportAssertionResult(noErrorsOccurred, failureMessage, true);
    }
  }
  
  // Numeric assertions
  
  isNearTo(number, precisionDigits = 4) {
    const result = Number.parseFloat((this._actual).toFixed(precisionDigits)) === number;
    const failureMessage = `be near to ${number} (using ${precisionDigits} precision digits)`;
    this._reportAssertionResult(result, failureMessage, false);
  }
  
  // Private
  
  _equalityAssertion(expected, criteria, shouldBeEqual) {
    const { comparisonResult, additionalFailureMessage, overrideFailureMessage } =
      EqualityAssertionStrategy.evaluate(this._actual, expected, criteria);
    
    const resultIsSuccessful = shouldBeEqual ? comparisonResult : !comparisonResult;
    if (overrideFailureMessage) {
      this._reportAssertionResult(resultIsSuccessful, overrideFailureMessage, true);
    } else {
      const expectationMessage = shouldBeEqual ? this.translated('be_equal_to') : this.translated('be_not_equal_to');
      const failureMessage = `${expectationMessage} ${Utils.prettyPrint(expected)}${additionalFailureMessage}`;
      this._reportAssertionResult(resultIsSuccessful, failureMessage, false);
    }
  };
  
  _booleanAssertion(expectedBoolean, failureMessage) {
    const resultIsSuccessful = this._actual === expectedBoolean;
    this._reportAssertionResult(resultIsSuccessful, failureMessage);
  }

  _undefinedAssertion(failureMessage) {
    const resultIsSuccessful = this._actual === undefined;
    this._reportAssertionResult(resultIsSuccessful, failureMessage);
  }

  _notUndefinedAssertion(failureMessage) {
    const resultIsSuccessful = this._actual !== undefined;
    this._reportAssertionResult(resultIsSuccessful, failureMessage);
  }
  
  _exceptionAssertion(errorExpectation, shouldFail) {
    let hasFailed = false;
    let actualError = undefined;
    try {
      this._actual();
      hasFailed = !shouldFail;
    } catch (error) {
      actualError = error;
      let errorCheck = this._checkIfErrorMatchesExpectation(errorExpectation, actualError);
      hasFailed = shouldFail ? errorCheck : !errorCheck;
    } finally {
      const toHappenOrNot = shouldFail ? this.translated('to_happen') : this.translated('not_to_happen');
      const expectedErrorIntroduction = `${this.translated('expected')} ${this.translated('expecting_error')} ${Utils.prettyPrint(errorExpectation)} ${toHappenOrNot}`;
      const failureMessage = typeof actualError !== 'undefined' ?
          `${expectedErrorIntroduction}, ${this.translated('but_got')} ${Utils.prettyPrint(actualError)} ${this.translated('instead')}` : expectedErrorIntroduction;
      this._reportAssertionResult(hasFailed, failureMessage, true);
    }
  }
  
  _checkIfErrorMatchesExpectation(errorExpectation, actualError) {
    const expectationIsRegex = errorExpectation.__proto__.hasOwnProperty('test');
    if (expectationIsRegex) {
      return errorExpectation.test(actualError);
    } else {
      return actualError === errorExpectation;
    }
  }
  
  _reportAssertionResult(wasSuccess, matcherFailureMessage, overrideFailureMessage) {
    if (wasSuccess) {
      this.report(TestResult.success());
    } else {
      const defaultFailureMessage = `${this.translated('expected')} ${this._actualResultAsString()} ${this.translated('to')}${matcherFailureMessage}`;
      this.report(TestResult.failure(overrideFailureMessage ? matcherFailureMessage : defaultFailureMessage));
    }
  }
  
  _actualResultAsString() {
    return Utils.prettyPrint(this._actual);
  }
}

module.exports = { Asserter, FailureGenerator, PendingMarker };
