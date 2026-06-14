import { environment } from '../../environments/environment'
import axios from 'axios'

const MAPPING_MODULE_UI_URL = `${environment.baseUrl}/module-has-ui-permission`

export const createModuleHasUiPermission = async (data) => {
  try {
    const response = await axios.post(`${MAPPING_MODULE_UI_URL}/create`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const searchModuleAssignedPermissions = async (realmId, applicationId, moduleId, query) => {
  try {
    const params = {}
    if (realmId && realmId !== '-1') params.realm_id = realmId
    if (applicationId && applicationId !== '-1') params.application_id = applicationId
    if (moduleId && moduleId !== '-1') params.module_id = moduleId
    if (query) params.query = query

    const response = await axios.get(`${MAPPING_MODULE_UI_URL}/search`, { params })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteModuleHasUiPermission = async (mappingId) => {
  try {
    const response = await axios.delete(`${MAPPING_MODULE_UI_URL}/delete`, {
      params: { module_has_ui_permission_id: mappingId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}
