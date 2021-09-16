exports.validationError = function (err) {
    var fields = {};
    var errors = Object.keys(err.errors);
    var messages = errors.map(function (e) { fields[e] = err.errors[e].properties.message; return fields[e]; });
    throw { success: false, message: messages.join(', '), error_fields: fields };
};
//# sourceMappingURL=validation_error.js.map