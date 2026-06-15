import { environment } from '../../environments/environment'
import axios from 'axios'

const USER_ROLE_PROFILE_URL = `${environment.baseUrl}/user-role-profile`

export const createUserRoleProfile = async (data) => {
  try {
    const response = await axios.post(`${USER_ROLE_PROFILE_URL}/create`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const searchUserRoleProfiles = async (realmId, applicationId, userRoleId, moduleId) => {
  try {
    const params = {}
    if (realmId && realmId !== '-1') params.realm_id = realmId
    if (applicationId && applicationId !== '-1') params.application_id = applicationId
    if (userRoleId && userRoleId !== '-1') params.user_role_id = userRoleId
    if (moduleId && moduleId !== '-1') params.module_id = moduleId

    const response = await axios.get(`${USER_ROLE_PROFILE_URL}/search`, { params })
    return response.data
  } catch (error) {
    throw error
  }
}

export const syncUserRoleProfile = async (data) => {
  try {
    const response = await axios.post(`${USER_ROLE_PROFILE_URL}/sync`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteUserRoleApiProfile = async (mappingId) => {
  try {
    const response = await axios.delete(`${USER_ROLE_PROFILE_URL}/delete/api`, {
      params: { mapping_id: mappingId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteUserRoleUiProfile = async (mappingId) => {
  try {
    const response = await axios.delete(`${USER_ROLE_PROFILE_URL}/delete/ui`, {
      params: { mapping_id: mappingId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}
