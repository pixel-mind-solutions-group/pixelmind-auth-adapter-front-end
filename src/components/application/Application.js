import React, { useEffect, useState, useCallback } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormInput,
  CFormSelect,
  CSpinner,
  CTableHeaderCell,
  CTableHead,
  CTable,
  CTableBody,
  CTableRow,
  CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSync } from '@coreui/icons'
import { toast } from 'react-toastify'
import Pagination from '../pagination/Pagination'
import { getActiveRealms, syncRealmsAndApplications } from '../../service/realm/RealmService'
import { searchApplications } from '../../service/application/ApplicationService'

const Application = () => {
  const [searchParam, setSearchParam] = useState('')
  const [applications, setApplications] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [size, setSize] = useState(5)

  const [realmFilter, setRealmFilter] = useState('-1')
  const [applicationFilter, setApplicationFilter] = useState('-1')
  const [statusFilter, setStatusFilter] = useState('-1')
  const [isSyncing, setIsSyncing] = useState(false)

  const [realmsOptions, setRealmsOptions] = useState([])
  const [applicationsOptions, setApplicationsOptions] = useState([])

  const fetchDropdownData = useCallback(async () => {
    try {
      const realmsRes = await getActiveRealms()
      if (realmsRes.status === 200) {
        setRealmsOptions(realmsRes.data)
      }
      setApplicationsOptions([])
    } catch (error) {
      toast.error('Failed to load filter dropdowns: ' + error.message)
    }
  }, [])

  const fetchApplications = useCallback(async () => {
    try {
      const data = await searchApplications(
        currentPage,
        size,
        searchParam,
        realmFilter,
        applicationFilter,
      )
      if (data.status === 200) {
        setApplications(data.data.applications)
        setTotalElements(data.data.total)
        setTotalPages(data.data.totalPages)
        setCurrentPage(data.data.page)
      }
    } catch (error) {
      toast.error('Failed to load applications: ' + error.message)
    }
  }, [currentPage, size, searchParam, realmFilter, applicationFilter])

  useEffect(() => {
    fetchDropdownData()
  }, [fetchDropdownData])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleResetFilters = () => {
    setRealmFilter('-1')
    setApplicationFilter('-1')
    setStatusFilter('-1')
    setSearchParam('')
    setCurrentPage(0)
    setApplicationsOptions([])
  }

  const handleRealmChange = async (realmId) => {
    setRealmFilter(realmId)
    setApplicationFilter('-1')
    setCurrentPage(0)

    try {
      if (realmId === '-1') {
        setApplicationsOptions([])
      } else {
        const searchRes = await searchApplications(0, 1000, null, realmId, null)
        if (searchRes.status === 200) {
          setApplicationsOptions(searchRes.data.applications || [])
        }
      }
    } catch (error) {
      toast.error('Failed to load applications for dropdown: ' + error.message)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    toast.info('Syncing applications...')
    try {
      const response = await syncRealmsAndApplications()
      if (response.status === 200) {
        const isDefault =
          realmFilter === '-1' &&
          applicationFilter === '-1' &&
          statusFilter === '-1' &&
          searchParam === '' &&
          currentPage === 0

        handleResetFilters()
        await fetchDropdownData()

        if (isDefault) {
          await fetchApplications()
        }
        toast.success('Applications synced successfully')
      } else {
        toast.error('Sync failed: ' + response.message)
      }
    } catch (error) {
      toast.error('Sync failed: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Manage Applications</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3 align-items-center">
              <CCol xs={12} md={6} className="d-flex flex-column flex-md-row gap-2">
                <CCol md="auto" className="flex-grow-1">
                  <label
                    className="form-label mb-1"
                    style={{
                      fontSize: '0.875rem',
                    }}
                  >
                    Realm:
                  </label>
                  <CFormSelect
                    id="realmFilter"
                    value={realmFilter}
                    onChange={(e) => handleRealmChange(e.target.value)}
                    size="sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="-1">All Realms</option>
                    {realmsOptions.map((realm) => (
                      <option key={realm.id} value={realm.id}>
                        {realm.realm}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md="auto" className="flex-grow-1">
                  <label
                    className="form-label mb-1"
                    style={{
                      fontSize: '0.875rem',
                    }}
                  >
                    Application:
                  </label>
                  <CFormSelect
                    id="applicationFilter"
                    value={applicationFilter}
                    onChange={(e) => setApplicationFilter(e.target.value)}
                    size="sm"
                    style={{ cursor: 'pointer' }}
                    disabled={realmFilter === '-1'}
                  >
                    <option value="-1">All Applications</option>
                    {applicationsOptions.map((app, index) => (
                      <option key={app.id ? `${app.id}-${index}` : index} value={app.id}>
                        {app.clientId} ({app.realm?.realm || 'N/A'})
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CCol>
              <CCol xs={12} md={6} className="d-flex justify-content-md-end gap-2">
                <CFormInput
                  type="text"
                  placeholder="Search application..."
                  size="sm"
                  style={{ maxWidth: '300px' }}
                  value={searchParam}
                  onChange={(e) => setSearchParam(e.target.value)}
                />
              </CCol>
            </CRow>
            <CRow className="mb-2">
              <CCol xs={12} className="d-flex gap-2">
                <CButton
                  color="primary"
                  size="sm"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="d-inline-flex align-items-center"
                >
                  {isSyncing ? (
                    <CSpinner size="sm" className="me-1" />
                  ) : (
                    <CIcon icon={cilSync} className="me-1" />
                  )}
                  Sync
                </CButton>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleResetFilters}
                  type="button"
                >
                  Clear Filters
                </button>
              </CCol>
            </CRow>
            <hr className="my-3" />
            <CCol xs={12}>
              <CTable>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell scope="col">Realm</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Application</CTableHeaderCell>
                    <CTableHeaderCell scope="col">UUID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Internal UUID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Realm Active</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Application Active</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {Array.isArray(applications) && applications.length > 0 ? (
                    applications.map((app, index) => (
                      <CTableRow key={app.id ? `${app.id}-${index}` : index}>
                        <CTableDataCell>{app.realm?.realm || 'N/A'}</CTableDataCell>
                        <CTableDataCell>{app.clientId}</CTableDataCell>
                        <CTableDataCell>{app.uuid || 'N/A'}</CTableDataCell>
                        <CTableDataCell>{app.internalApplicationUuid || 'N/A'}</CTableDataCell>
                        <CTableDataCell>
                          <span className={`badge bg-${app.realm?.active ? 'success' : 'danger'}`}>
                            {app.realm?.active ? 'Active' : 'Inactive'}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <span className={`badge bg-${app.active ? 'success' : 'danger'}`}>
                            {app.active ? 'Active' : 'Inactive'}
                          </span>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="6" className="text-center py-4">
                        <span className="text-muted">No applications found</span>
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={setCurrentPage}
              />
            </CCol>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Application
