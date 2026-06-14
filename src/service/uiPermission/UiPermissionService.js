import { environment } from '../../environments/environment'
import axios from 'axios'

const UI_PERMISSION_URL = `${environment.baseUrl}/ui-permission`

export const createOrUpdatePermission = async (data) => {
  try {
    const response = await axios.post(`${UI_PERMISSION_URL}/create-or-update`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPermissionById = async (uiPermissionId) => {
  try {
    const response = await axios.get(`${UI_PERMISSION_URL}/get`, {
      params: { ui_permission_id: uiPermissionId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deletePermissionById = async (uiPermissionId) => {
  try {
    const response = await axios.delete(`${UI_PERMISSION_URL}/delete`, {
      params: { ui_permission_id: uiPermissionId },
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

    const response = await axios.get(`${UI_PERMISSION_URL}/search`, {
      params,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getActivePermissions = async (realmId, applicationId, uiPermissionName) => {
  try {
    const params = {
      realm_id: realmId,
      application_id: applicationId,
    }
    if (uiPermissionName) {
      params.ui_permission_name = uiPermissionName
    }
    const response = await axios.get(`${UI_PERMISSION_URL}/active`, { params })
    return response.data
  } catch (error) {
    throw error
  }
}
