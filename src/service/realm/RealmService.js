import { environment } from '../../environments/environment'
import axios from 'axios'

const REALM_API_URL = `${environment.baseUrl}/realm`

export const getActiveRealms = async (onlyActive = true) => {
  try {
    const response = await axios.get(`${REALM_API_URL}/active`, {
      params: { only_active: onlyActive }
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const syncRealmsAndApplications = async () => {
  try {
    const response = await axios.post(`${REALM_API_URL}/sync`)
    return response.data
  } catch (error) {
    throw error
  }
}
