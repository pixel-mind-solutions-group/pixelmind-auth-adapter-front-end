import { environment } from '../../environments/environment'
import axios from 'axios'

const USER_ROLE_URL = `${environment.baseUrl}/user-role`

export const createOrUpdateUserRole = async (data) => {
  try {
    const response = await axios.post(`${USER_ROLE_URL}/create-or-update`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getUserRoleById = async (roleId) => {
  try {
    const response = await axios.get(`${USER_ROLE_URL}/get`, {
      params: { role_id: roleId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteUserRole = async (roleId) => {
  try {
    const response = await axios.delete(`${USER_ROLE_URL}/delete`, {
      params: { role_id: roleId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const searchUserRoles = async (page, size, query, active, realmId, applicationId) => {
  try {
    const params = { page, size }
    if (query) params.query = query
    if (active !== undefined && active !== null && active !== '') {
      params.active = active === 'true' || active === true
    }
    if (realmId && realmId !== '-1') params.realm_id = realmId
    if (applicationId && applicationId !== '-1') params.application_id = applicationId

    const response = await axios.get(`${USER_ROLE_URL}/search`, { params })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getActiveUserRoles = async (realmId, applicationId) => {
  try {
    const params = {}
    if (realmId && realmId !== '-1') params.realm_id = realmId
    if (applicationId && applicationId !== '-1') params.application_id = applicationId

    const response = await axios.get(`${USER_ROLE_URL}/active`, { params })
    return response.data
  } catch (error) {
    throw error
  }
}
