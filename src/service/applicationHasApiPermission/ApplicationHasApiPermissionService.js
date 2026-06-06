import { environment } from '../../environments/environment'
import axios from 'axios'

const MAPPING_API_URL = `${environment.baseUrl}/application-has-api-permission`

export const createApplicationHasApiPermission = async (data) => {
  try {
    const response = await axios.post(`${MAPPING_API_URL}/create`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const searchAssignedPermissions = async (realmId, applicationId, apiPermissionName) => {
  try {
    const params = {}
    if (realmId && realmId !== '-1') params.realm_id = realmId
    if (applicationId && applicationId !== '-1') params.application_id = applicationId
    if (apiPermissionName) params.api_permission_name = apiPermissionName

    const response = await axios.get(`${MAPPING_API_URL}/search`, { params })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteApplicationHasApiPermission = async (mappingId) => {
  try {
    const response = await axios.delete(`${MAPPING_API_URL}/delete`, {
      params: { application_has_api_permission_id: mappingId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}
