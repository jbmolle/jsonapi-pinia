/**
 * Utility functions
 */

/**
 * Return the URL path (links.self) or construct from type/id
 * @param {object} resource - A resource object
 * @return {string} The record's URL path
 */
export const getUrl = (baseUrl: string, url: string) => {
  if (url.startsWith('/')) {
    return new URL(baseUrl + url)
  }
  return new URL(url)
}
