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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSync } from '@coreui/icons'
import { toast } from 'react-toastify'
import Pagination from '../pagination/Pagination'
import {
  getActiveRealms,
  syncRealmsAndApplications,
  deleteRealm,
  deleteByRealmAndApplication,
} from '../../service/realm/RealmService'
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

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchDropdownData = useCallback(async () => {
    try {
      const realmsRes = await getActiveRealms(false) // fetch all realms including inactive ones
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
      const activeParam = statusFilter === '-1' ? null : statusFilter === 'active'
      const data = await searchApplications(
        currentPage,
        size,
        searchParam,
        realmFilter,
        applicationFilter,
        activeParam,
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
  }, [currentPage, size, searchParam, realmFilter, applicationFilter, statusFilter])

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

  const confirmDelete = (app) => {
    setItemToDelete(app)
    setDeleteModalVisible(true)
  }

  const cancelDelete = () => {
    setDeleteModalVisible(false)
    setItemToDelete(null)
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    const realmId = itemToDelete.realm?.id
    const applicationId = itemToDelete.id
    if (!realmId) {
      toast.error('Realm ID not found')
      return
    }

    setIsDeleting(true)
    try {
      let response
      if (applicationId) {
        response = await deleteByRealmAndApplication(realmId, applicationId)
      } else {
        response = await deleteRealm(realmId)
      }

      if (response.status === 200) {
        toast.success(response.message || 'Deleted successfully')
        setDeleteModalVisible(false)
        setItemToDelete(null)
        await fetchDropdownData()
        await fetchApplications()
      } else {
        toast.error('Failed to delete: ' + (response.message || 'Unknown error'))
      }
    } catch (error) {
      toast.error('Failed to delete: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsDeleting(false)
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
            {/* Filtration Section */}
            <div
              className="row g-3 mb-4 pb-3 border-bottom align-items-end"
              style={{ borderColor: 'var(--cui-border-color)' }}
            >
              {/* Realm Select */}
              <CCol xs={12} sm={6} md={3}>
                <label
                  htmlFor="realmFilter"
                  className="form-label text-muted small font-weight-bold mb-1"
                >
                  Filter by Realm
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
                      {realm.realm} {!realm.active && '(Inactive)'}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              {/* Application Select */}
              <CCol xs={12} sm={6} md={3}>
                <label
                  htmlFor="applicationFilter"
                  className="form-label text-muted small font-weight-bold mb-1"
                >
                  Filter by Application
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

              {/* Application Status Select */}
              <CCol xs={12} sm={6} md={2}>
                <label
                  htmlFor="statusFilter"
                  className="form-label text-muted small font-weight-bold mb-1"
                >
                  Filter by Status
                </label>
                <CFormSelect
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(0)
                  }}
                  size="sm"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="-1">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </CFormSelect>
              </CCol>

              {/* Search Text Input */}
              <CCol xs={12} sm={6} md={2}>
                <label
                  htmlFor="searchParamInput"
                  className="form-label text-muted small font-weight-bold mb-1"
                >
                  Search
                </label>
                <CFormInput
                  id="searchParamInput"
                  type="text"
                  placeholder="Search applications..."
                  size="sm"
                  value={searchParam}
                  onChange={(e) => {
                    setSearchParam(e.target.value)
                    setCurrentPage(0)
                  }}
                />
              </CCol>

              {/* Action Buttons */}
              <CCol xs={12} md={2} className="d-flex gap-2">
                <CButton
                  color="primary"
                  size="sm"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="d-inline-flex align-items-center w-100 justify-content-center shadow-sm"
                  style={{ minHeight: '31px', fontWeight: '500' }}
                >
                  {isSyncing ? (
                    <CSpinner size="sm" className="me-1" />
                  ) : (
                    <CIcon icon={cilSync} className="me-1" />
                  )}
                  Sync
                </CButton>
                <button
                  className="btn btn-sm btn-outline-secondary w-100"
                  onClick={handleResetFilters}
                  type="button"
                  style={{ minHeight: '31px', fontWeight: '500' }}
                >
                  Clear
                </button>
              </CCol>
            </div>
            <CCol xs={12}>
              <CTable>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell scope="col">Realm</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Application</CTableHeaderCell>
                    <CTableHeaderCell scope="col">UUID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Internal UUID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Realm Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Application Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
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
                        <CTableDataCell>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger px-3"
                            onClick={() => confirmDelete(app)}
                            title="Delete all data for this realm and application"
                          >
                            Delete
                          </button>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="7" className="text-center py-4">
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

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModalVisible} onClose={cancelDelete} backdrop="static">
        <CModalHeader>
          <CModalTitle>Confirm Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {itemToDelete ? (
            <div>
              <p>
                Are you sure you want to delete all data related to realm{' '}
                <strong>{itemToDelete.realm?.realm || 'N/A'}</strong> and application{' '}
                <strong>{itemToDelete.clientId || 'N/A'}</strong>?
              </p>
              <p className="text-danger small mb-0">
                <strong>Warning:</strong> This will delete everything inside the database related to this realm and application without validation. This action cannot be undone.
              </p>
            </div>
          ) : (
            <p>Are you sure you want to delete this?</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={cancelDelete} size="sm" disabled={isDeleting}>
            Cancel
          </CButton>
          <button
            type="button"
            className="btn btn-sm btn-danger px-3 d-inline-flex align-items-center"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <CSpinner size="sm" className="me-1" />}
            Delete
          </button>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Application
