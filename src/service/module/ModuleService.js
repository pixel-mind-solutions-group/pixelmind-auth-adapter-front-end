import { environment } from '../../environments/environment'
import axios from 'axios'

const MODULE_API_URL = `${environment.baseUrl}/module`

export const createOrUpdateModule = async (data) => {
  try {
    const response = await axios.post(`${MODULE_API_URL}/create-or-update`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getModuleById = async (moduleId) => {
  try {
    const response = await axios.get(`${MODULE_API_URL}/get`, {
      params: { module_id: moduleId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteModuleById = async (moduleId) => {
  try {
    const response = await axios.delete(`${MODULE_API_URL}/delete`, {
      params: { module_id: moduleId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const searchModules = async (page, size, query, realmId, applicationId, active) => {
  try {
    const params = {
      page,
      size,
    }
    if (query) params.query = query
    if (realmId !== undefined && realmId !== null && realmId !== '-1' && realmId !== -1) {
      params.realm_id = realmId
    }
    if (
      applicationId !== undefined &&
      applicationId !== null &&
      applicationId !== '-1' &&
      applicationId !== -1
    ) {
      params.application_id = applicationId
    }
    if (typeof active === 'boolean') {
      params.active = active
    }

    const response = await axios.get(`${MODULE_API_URL}/search`, {
      params,
    })
    return response.data
  } catch (error) {
    throw error
  }
}
