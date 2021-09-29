'use strict';

class FakeProcess {
  constructor() {
    this._lastExitCode = null;
  }

  exit(code) {
    this._lastExitCode = code;
  }

  lastExitCode() {
    return this._lastExitCode;
  }
}

module.exports = FakeProcess;