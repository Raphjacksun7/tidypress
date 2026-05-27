/**
 * Cast a partial test double to a concrete service type for checkJs.
 *
 * @template T
 * @param {any} value
 * @returns {T}
 */
export function mockService(value) {
  return /** @type {T} */ (value)
}
