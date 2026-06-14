import { environment } from '../../environments/environment'
import axios from 'axios'

const USER_ROLE_PROFILE_URL = `${environment.baseUrl}/user-role-has-modules`

export const createUserRoleProfile = async (data) => {
  try {
    const response = await axios.post(`${USER_ROLE_PROFILE_URL}/create`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const searchUserRoleProfiles = async (realmId, applicationId) => {
  try {
    const params = {}
    if (realmId && realmId !== '-1') params.realm_id = realmId
    if (applicationId && applicationId !== '-1') params.application_id = applicationId

    const response = await axios.get(`${USER_ROLE_PROFILE_URL}/search`, { params })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteUserRoleProfile = async (mappingId) => {
  try {
    const response = await axios.delete(`${USER_ROLE_PROFILE_URL}/delete`, {
      params: { user_role_has_modules_id: mappingId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}
