'use strict';

const { I18n } = require('./i18n');
const Formatter = require('./formatter');

class ConsoleUI {

  #formatter;

  static successfulExitCode() {
    return 0;
  }
  
  static failedExitCode() {
    return 1;
  }

  // instance creation

  constructor(process, console) {
    this._process = process;
    this._console = console;
    this.useLanguage(I18n.defaultLanguage());
  }
  
  // Callbacks for runner/suite/test
  
  testCallbacks() {
    return {
      whenPending: test =>
        this.#formatter.displayPendingResult(test),
      whenSkipped: test =>
        this.#formatter.displaySkippedResult(test),
      whenSuccess: test =>
        this.#formatter.displaySuccessResult(test),
      whenFailed: test =>
        this.#formatter.displayFailureResult(test),
      whenErrored: test =>
        this.#formatter.displayErrorResult(test),
    };
  }
  
  suiteCallbacks() {
    return {
      onStart: suite =>
        this.#formatter.displaySuiteStart(suite),
      onFinish: suite =>
        this.#formatter.displaySuiteEnd(suite),
    };
  }
  
  testRunnerCallbacks() {
    return {
      onFinish: runner =>
        this.#formatter.displayRunnerEnd(runner),
      onSuccess: _runner =>
        this.#exitWithCode(ConsoleUI.successfulExitCode()),
      onFailure: _runner =>
        this.#exitWithCode(ConsoleUI.failedExitCode()),
    };
  }

  // application events
  
  start(configuration, paths, runnerBlock) {
    this.#formatter.start();
    this.#formatter.displayInitialInformation(configuration, paths);
    runnerBlock.call();
    this.#formatter.end();
  }
  
  useLanguage(language) {
    const i18n = new I18n(language);
<<<<<<< Updated upstream
    this._formatter = new Formatter(this._console, i18n);
  }
  
  exitWithError(...errorMessages) {
    errorMessages.forEach(errorMessage =>
      this._formatter.displayError(errorMessage),
    );
    this._exitWithCode(ConsoleUI.failedExitCode());
=======
    this.#formatter = new Formatter(console, i18n);
  }
  
  exitWithError(errorMessage) {
    this.#formatter.displayError(errorMessage);
    this.#exitWithCode(ConsoleUI.failedExitCode());
>>>>>>> Stashed changes
  }

  // private
  
<<<<<<< Updated upstream
  _exitWithCode(exitCode) {
    this._process.exit(exitCode);
=======
  #exitWithCode(exitCode) {
    process.exit(exitCode);
>>>>>>> Stashed changes
  }
}

module.exports = ConsoleUI;
