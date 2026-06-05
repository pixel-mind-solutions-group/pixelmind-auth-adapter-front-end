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

export const searchUsers = (currentPage, size, query, active) => {
  try {
    const params = {
      page: currentPage,
      size: size,
    }
    if (query) params.query = query
    // only include active when explicitly provided (boolean)
    if (typeof active === 'boolean') params.active = active

    const response = axios.get(`${USER_API_URL}/search`, {
      params,
    })
    return response
  } catch (error) {
    throw error
  }
}

export const getUserById = async (userId) => {
  try {
    const resp = await axios.get(`${USER_API_URL}/get`, {
      params: { user_id: userId },
    })
    return resp.data?.data || resp.data
  } catch (error) {
    throw error
  }
}

export const deleteUserById = async (userId) => {
  try {
    const resp = await axios.delete(`${USER_API_URL}/delete`, {
      params: { user_id: userId },
    })
    return resp.data
  } catch (error) {
    throw error
  }
}
