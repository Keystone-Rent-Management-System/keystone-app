import {handleReportError} from './Helper';

export const getError = error => {
  // Report error to sentry
  handleReportError(error);

  return error.response && error.response.data.message
    ? error.response.data.message
    : error.message;
};
