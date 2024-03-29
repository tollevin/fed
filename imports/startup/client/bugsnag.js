import bugsnag from 'bugsnag-js';

(() => {
  if (window.location.hostname === 'localhost') { return; }

  const bugsnagClient = bugsnag('ed63bdfaf7876bf7db58e9076bafb27b');
  /* eslint-disable */
  window.onerror = (message, url, lineNumber, columnNumber, error) => {
    const errorFull = `
    url: ${url}
    user: ${Meteor.userId()}
    message: ${message}
    lineNumber: ${lineNumber}
    columnNumber: ${columnNumber}
    errorMessage: ${error.message}
    errorStack: ${error.stack}
    `;
    bugsnagClient.notify(new Error(errorFull));
  };

  const originalMeteorError = Meteor.Error;

  Meteor.Error = function (error, reason, details) {
    const errorFull = `
    Meteor Error: 
    reason: ${reason}
    user: ${Meteor.userId()}
    details: ${details}
    error: ${error}
    `;
    bugsnagClient.notify(new Error(errorFull));

    return originalMeteorError.apply(this, arguments);
  };

  const originalBlazeCatchingExceptions = Blaze._reportException;

  Blaze._reportException = function (error, where) {
    const errorFull = `
    Blaze Error: 
    where: ${where}
    user: ${Meteor.userId()}
    message: ${error.message}
    stack: ${error.stack}
    `;
    bugsnagClient.notify(new Error(errorFull));

    return originalBlazeCatchingExceptions.apply(this, arguments);
  };
  /* eslint-enable */
})();
