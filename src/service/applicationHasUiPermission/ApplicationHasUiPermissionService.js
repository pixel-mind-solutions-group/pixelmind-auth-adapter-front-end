import { environment } from '../../environments/environment'
import axios from 'axios'

const MAPPING_UI_URL = `${environment.baseUrl}/application-has-ui-permission`

export const createApplicationHasUiPermission = async (data) => {
  try {
    const response = await axios.post(`${MAPPING_UI_URL}/create`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const searchAssignedPermissions = async (realmId, applicationId, uiPermissionName) => {
  try {
    const params = {}
    if (realmId && realmId !== '-1') params.realm_id = realmId
    if (applicationId && applicationId !== '-1') params.application_id = applicationId
    if (uiPermissionName) params.ui_permission_name = uiPermissionName

    const response = await axios.get(`${MAPPING_UI_URL}/search`, { params })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteApplicationHasUiPermission = async (mappingId) => {
  try {
    const response = await axios.delete(`${MAPPING_UI_URL}/delete`, {
      params: { application_has_ui_permission_id: mappingId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}
