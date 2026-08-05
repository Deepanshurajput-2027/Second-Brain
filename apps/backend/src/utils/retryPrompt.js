const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Executes a given async function with exponential backoff on 503/429 errors.
 * 
 * @param {Function} apiCallFn - The async function to execute.
 * @param {number} maxRetries - Maximum number of retries (default: 3).
 * @param {number} initialDelay - Initial delay in milliseconds (default: 1000).
 * @returns {Promise<any>} - The result of the async function.
 */
export const withExponentialBackoff = async (apiCallFn, maxRetries = 3, initialDelay = 1000) => {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt <= maxRetries) {
    try {
      const result = await apiCallFn();
      return result;
    } catch (err) {
      const status = err.status || err.response?.status || err?.error?.code;
      if (status === 503 || status === 429) {
        attempt++;
        if (attempt >= maxRetries) {
          throw err;
        }
        await sleep(delay);
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
};
