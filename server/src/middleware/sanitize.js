import mongoSanitize from 'express-mongo-sanitize';

/**
 * Middleware that strips out keys starting with $ or containing . from
 * req.body, req.query, and req.params to prevent NoSQL injection attacks.
 */
export const cleanMongoInputs = mongoSanitize({
  replaceWith: '_',
});

/**
 * Escapes regex special characters to prevent Regular Expression Denial of Service (ReDoS)
 * when querying database strings with dynamic user input.
 */
export const escapeRegexString = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Middleware that automatically sanitizes the 'search' query parameter by escaping
 * regex special characters before it gets queried in mongoose search aggregates.
 */
export const sanitizeSearchQuery = (req, res, next) => {
  if (req.query && typeof req.query.search === 'string') {
    req.query.search = escapeRegexString(req.query.search.trim());
  }
  next();
};
