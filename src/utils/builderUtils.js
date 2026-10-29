export function isDate(format) {
  return (
    format === 'date' ||
    format === 'time' ||
    format === 'time-full' ||
    format === 'date-time' ||
    format === 'date-time-full' ||
    format === 'year' ||
    format === 'month' ||
    format === 'month-year' ||
    format === 'quarters' ||
    format === 'day-month'
  );
}

/**
 * Converts list custom item `lx.modelPath` (model dot notation from the root) into keys relative to the list row.
 * The path has to start with the model path of the list.
 * e.g. ('list.person.firstName', 'list') -> ['person', 'firstName']
 * e.g. ('list', 'list') -> [] (the row itself)
 * @param {string} modelPath - Model path from the root, e.g. 'list.name'.
 * @param {string} listPath - Model path of the list, e.g. 'list'.
 * @returns {string[] | null} Row relative keys, or null if the path doesn't point inside the list row.
 */
export function getListRowKeys(modelPath, listPath) {
  if (typeof modelPath !== 'string' || typeof listPath !== 'string') return null;
  const parts = modelPath.split('.').filter(Boolean);
  const listParts = listPath.split('.').filter(Boolean);
  if (!parts.length || !listParts.length || parts.length < listParts.length) return null;
  if (listParts.some((part, index) => parts[index] !== part)) return null;

  return parts.slice(listParts.length);
}

/**
 * Resolves the value in the list row referenced by `lx.modelPath`.
 * @param {string} modelPath - Model path from the root, e.g. 'list.name'.
 * @param {object} row - Current list row.
 * @param {string} listPath - Model path of the list, e.g. 'list'.
 * @returns {*} Referenced value or undefined.
 */
export function resolveListModelPath(modelPath, row, listPath) {
  const keys = getListRowKeys(modelPath, listPath);
  if (!keys) return undefined;

  return keys.reduce(
    (value, key) => (value === null || value === undefined ? undefined : value[key]),
    row
  );
}
