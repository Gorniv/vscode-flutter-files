/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
type MergeRecord = Record<string, unknown>;

const isObject = (item: unknown): item is MergeRecord =>
  item !== null && typeof item === 'object' && !Array.isArray(item);

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
const mergeDeep = <T extends object>(target: T, ...sources: object[]): T => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key] as MergeRecord, source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
};

export default mergeDeep;
