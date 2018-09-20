import bugsnag from 'bugsnag-js';

const bugsnagClient = bugsnag('ed63bdfaf7876bf7db58e9076bafb27b');

window.onerror = (message, url, lineNumber, columnNumber, error) => {
  const errorFull = `
    url: ${url}
    message: ${message}
    lineNumber ${lineNumber}
    columnNumber ${columnNumber}
    error ${error}
    `;
  bugsnagClient.notify(new Error(errorFull));
};
