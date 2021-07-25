const decorators = require('./decorators');

const validationError = err => {
  const fields = {};
  const errors = Object.keys(err.errors);
  const messages = errors.map(e => { fields[e] = err.errors[e].properties.message; return fields[e]} );
  throw { success: false, message: messages.join(', '), error_fields: fields };
}

module.exports = {
  decorators,
  validationError
}
