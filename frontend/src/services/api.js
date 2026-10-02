/**
 * Simple API client utility for backend communication
 */

const BASE_URL = '/api';

/**
 * Fetch health check status from the backend
 * @returns {Promise<{ success: boolean, message: string, database?: object }>}
 */
export async function getHealthStatus() {
  const response = await fetch(`${BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
