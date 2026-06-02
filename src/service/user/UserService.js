import { environment } from '../../environments/environment'
import axios from 'axios'

const USER_API_URL = `${environment.baseUrl}` + '/user'

export const createOrModify = async (data) => {
  try {
    const response = await fetch(`${USER_API_URL}/register-or-modify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error) {
    throw error
  }
}

export const searchUsers = (currentPage, size, query) => {
  try {
    const response = axios.get(`${USER_API_URL}/search`, {
      params: {
        page: currentPage,
        size: size,
        query: query,
      },
    })
    return response
  } catch (error) {
    throw error
  }
}
