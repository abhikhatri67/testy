'use strict';

const TestResult = require('./test_result');

class Test {
  constructor(name, body, callbacks) {
    this._name = name;
    this._body = body;
    this._callbacks = callbacks;
    this._result = undefined;
  }
  
  // Execution
  
  run(failFastMode) {
    TestResult.evaluate(this, failFastMode);
  }
  
  evaluate() {
    try {
      this.body().call();
    } catch (error) {
      this.setResult(TestResult.error(error));
    }
  }
  
  markPending(pendingResult) {
    this.setResult(pendingResult);
    this.finishWithPendingStatus();
  }
  
  markSkipped(skippedResult) {
    this.setResult(skippedResult);
    this._callbacks.whenSkipped(this);
  }
  
  setResult(result) {
    if(this.hasNoResult() || this.isSuccess())
      this._result = result;
  }
  
  finishWithSuccess() {
    this._callbacks.whenSuccess(this);
  }
  
  finishWithFailure() {
    this._callbacks.whenFailed(this);
  }
  
  finishWithError() {
    this._callbacks.whenErrored(this);
  }
  
  finishWithPendingStatus() {
    this._callbacks.whenPending(this);
  }
  
  // Testing
  
  hasDefinition() {
    return this.body() !== undefined;
  }
  
  hasNoResult() {
    return this.result() === undefined;
  }
  
  isSuccess() {
    return this.result().isSuccess();
  }
  
  isPending() {
    return this.result().isPending();
  }
  
  isExplicitlyMarkedPending() {
    return this.result().isExplicitlyMarkedPending();
  }
  
  isSkipped() {
    return this.result().isSkipped();
  }
  
  isError() {
    return this.result().isError();
  }
  
  isFailure() {
    return this.result().isFailure();
  }
  
  // Accessing
  
  name() {
    return this._name;
  }
  
  result() {
    return this._result;
  }
  
  body() {
    return this._body;
  }
}

module.exports = Test;
