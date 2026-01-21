/**
 * API Utility Functions
 * 
 * This file will contain all API call functions.
 * We'll add them step by step as we integrate each API.
 * 
 * For now, this is a placeholder. We'll build it together!
 */

// API Base URL (from constants)
import { API_BASE_URL } from './constants.js'

/**
 * Helper function to get auth token from localStorage
 */
export const getAuthToken = () => {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    return userData.token || null
  }
  return null
}

/**
 * Helper function to make API requests
 * We'll use this for all API calls
 * 
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {object} options - Fetch options (method, body, etc.)
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken()
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token.trim()}` }),
      ...options.headers
    },
    ...options
  }

  // Remove headers from options to avoid duplication
  if (options.headers) {
    delete options.headers
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong')
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * API Functions will be added here step by step:
 * 
 * Step 1: Authentication APIs
 * - loginUser(email, password)
 * - signupUser(userData)
 * - getCurrentUser()
 * 
 * Step 2: PG APIs
 * - getPGs(filters)
 * - getPGById(id)
 * - createPG(pgData)
 * - updatePG(id, pgData)
 * - deletePG(id)
 * 
 * Step 3: Hostel APIs
 * - Similar to PG APIs
 * 
 * Step 4: Marketplace APIs
 * - getMarketplaceItems(filters)
 * - createMarketplaceItem(itemData)
 * - deleteMarketplaceItem(id)
 * 
 * Step 5: Chat APIs
 * - getConversations()
 * - getMessages(conversationId)
 * - sendMessage(conversationId, text)
 * 
 * Step 6: File Upload
 * - uploadFiles(files, type)
 */

// Export placeholder - we'll add real functions step by step
export default {
  // Functions will be added here
}
