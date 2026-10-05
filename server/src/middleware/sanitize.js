import mongoSanitize from 'express-mongo-sanitize';

/**
 * Strips keys starting with $ or containing . from req.body, req.query,
 * and req.params to prevent NoSQL injection attacks.
 */
export const cleanMongoInputs = mongoSanitize({
  replaceWith: '_',
});
