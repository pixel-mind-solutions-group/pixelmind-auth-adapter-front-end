import { environment } from '../../environments/environment'
import axios from 'axios'

const REALM_API_URL = `${environment.baseUrl}/realm`

export const getActiveRealms = async () => {
  try {
    const response = await axios.get(`${REALM_API_URL}/active`)
    return response.data
  } catch (error) {
    throw error
  }
}
