const _ = require('underscore');

const errorLibrary = {
    PAE0001: {
        status: 101,
        error_code: '',
        error_summary: 'Repeat passsword wrong',
        error_message: 'Password confirmation does not match password you provided, please type the password again.'
    },
    PAE0002: {
        status: 101,
        error_code: '',
        error_summary: 'Already registered.',
        error_message: 'The email you provided is already registered with us.'
    },
};

module.exports.getError = (error_code, exception) => {
    let err = errorLibrary[error_code];
    if (exception) {
        err.stack = exception.stack.toString();
    }
    return err;
};