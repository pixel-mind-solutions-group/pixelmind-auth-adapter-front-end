import { environment } from '../../environments/environment'
import axios from 'axios'

const USER_PROFILE_URL = `${environment.baseUrl}/user-profile`

export const registerOrModifyUserProfile = async (data) => {
  try {
    const response = await axios.post(`${USER_PROFILE_URL}/register-or-modify`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getUserProfileById = async (profileId) => {
  try {
    const response = await axios.get(`${USER_PROFILE_URL}/get`, {
      params: { profile_id: profileId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteUserProfileById = async (profileId) => {
  try {
    const response = await axios.delete(`${USER_PROFILE_URL}/delete`, {
      params: { profile_id: profileId },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const searchUserProfiles = async (
  page = 0,
  size = 5,
  realmId,
  applicationId,
  userId,
  userRoleId,
  query,
) => {
  try {
    const params = { page, size }
    if (realmId && realmId !== '-1') params.realm_id = realmId
    if (applicationId && applicationId !== '-1') params.application_id = applicationId
    if (userId && userId !== '-1') params.user_id = userId
    if (userRoleId && userRoleId !== '-1') params.user_role_id = userRoleId
    if (query && query.trim() !== '') params.query = query

    const response = await axios.get(`${USER_PROFILE_URL}/search`, { params })
    return response.data
  } catch (error) {
    throw error
  }
}
