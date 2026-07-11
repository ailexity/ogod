'use strict';

const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');

/**
 * Validate and coerce a request part against a Zod schema. On success the parsed
 * (typed) value replaces the raw one, so controllers get clean input.
 *
 *   router.post('/', validate(createTripSchema), controller.create)
 *   router.get('/', validate(listQuerySchema, 'query'), controller.list)
 */
function validate(schema, source = 'body') {
  return function validator(req, _res, next) {
    try {
      req[source] = schema.parse(req[source]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        }));
        return next(ApiError.badRequest('Validation failed', details));
      }
      return next(err);
    }
  };
}

module.exports = validate;
