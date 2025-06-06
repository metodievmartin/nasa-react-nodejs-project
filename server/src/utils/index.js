/**
 * Check if a given value is a valid Date object.
 * @param {Date} d - The Date object to be validated.
 * @returns {boolean} true if the value is a valid Date object, false otherwise.
 * @example
 * // Returns true for valid Date objects
 * isValidDate(new Date()) // true
 *
 * // Returns false for date strings (must be a Date object)
 * isValidDate('2022-01-01') // false
 *
 * // Returns false for non-Date objects
 * isValidDate({}) // false
 */
function isValidDate(d) {
  return d instanceof Date && !isNaN(d.valueOf());
}

module.exports = {
  isValidDate,
};
