import { environment } from '../../environments/environment'
import axios from 'axios'

const API_PERMISSION_URL = `${environment.baseUrl}/api-permission`

export const createOrUpdatePermission = async (data) => {
  try {
    const response = await axios.post(`${API_PERMISSION_URL}/create-or-update`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPermissionById = async (apiPermissionId) => {
  try {
    const response = await axios.get(`${API_PERMISSION_URL}/get`, {
      params: { api_permission_id: apiPermissionId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deletePermissionById = async (apiPermissionId) => {
  try {
    const response = await axios.delete(`${API_PERMISSION_URL}/delete`, {
      params: { api_permission_id: apiPermissionId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const searchPermissions = async (page, size, query, active) => {
  try {
    const params = {
      page,
      size,
    }
    if (query) params.query = query
    if (typeof active === 'boolean') {
      params.active = active
    }

    const response = await axios.get(`${API_PERMISSION_URL}/search`, {
      params,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getActivePermissions = async (realmId, applicationId, apiPermissionName) => {
  try {
    const params = {
      realm_id: realmId,
      application_id: applicationId,
    }
    if (apiPermissionName) {
      params.api_permission_name = apiPermissionName
    }
    const response = await axios.get(`${API_PERMISSION_URL}/active`, { params })
    return response.data
  } catch (error) {
    throw error
  }
}
