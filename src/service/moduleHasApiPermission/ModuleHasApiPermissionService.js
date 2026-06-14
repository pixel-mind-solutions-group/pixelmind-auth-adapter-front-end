import { environment } from '../../environments/environment'
import axios from 'axios'

const MAPPING_MODULE_API_URL = `${environment.baseUrl}/module-has-api-permission`

export const createModuleHasApiPermission = async (data) => {
  try {
    const response = await axios.post(`${MAPPING_MODULE_API_URL}/create`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const searchModuleAssignedPermissions = async (realmId, applicationId, moduleId, apiPermissionName) => {
  try {
    const params = {}
    if (realmId && realmId !== '-1') params.realm_id = realmId
    if (applicationId && applicationId !== '-1') params.application_id = applicationId
    if (moduleId && moduleId !== '-1') params.module_id = moduleId
    if (apiPermissionName) params.api_permission_name = apiPermissionName

    const response = await axios.get(`${MAPPING_MODULE_API_URL}/search`, { params })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteModuleHasApiPermission = async (mappingId) => {
  try {
    const response = await axios.delete(`${MAPPING_MODULE_API_URL}/delete`, {
      params: { module_has_api_permission_id: mappingId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}
