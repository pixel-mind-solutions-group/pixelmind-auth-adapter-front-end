import { environment } from '../../environments/environment'
import axios from 'axios'

const APPLICATION_API_URL = `${environment.baseUrl}/application`

export const getActiveApplications = async () => {
  try {
    const response = await axios.get(`${APPLICATION_API_URL}/active`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const searchApplications = async (page, size, query, realmId, applicationId, active) => {
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
    if (active !== undefined && active !== null) {
      params.active = active
    }

    const response = await axios.get(`${APPLICATION_API_URL}/search`, {
      params,
    })
    return response.data
  } catch (error) {
    throw error
  }
}
